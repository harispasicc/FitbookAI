import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/server/http/api-error";
import type { SessionPayload } from "@/server/auth/session";
import { getDailyAiLimitForSessionRole } from "@/server/ai/ai-limits";
import { getUtcDayStart } from "@/server/ai/utc-day";

export type AiUsageSnapshot = {
  userId: string;
  usageDate: Date;
  count: number;
  limit: number;
};

export async function assertAndConsumeAiUsage(
  session: SessionPayload,
): Promise<AiUsageSnapshot> {
  const limit = getDailyAiLimitForSessionRole(session.role);
  return consumeDailyAiUsage(session.sub, limit);
}

export async function consumeDailyAiUsage(
  userId: string,
  limit: number,
  usageDate = getUtcDayStart(),
): Promise<AiUsageSnapshot> {
  return prisma.$transaction(
    async (tx) => {
      const existing = await tx.aiUsage.findUnique({
        where: { userId_date: { userId, date: usageDate } },
      });

      if (existing && existing.count >= limit) {
        throw ApiError.aiDailyLimitReached(limit);
      }

      if (existing) {
        const updated = await tx.aiUsage.update({
          where: { id: existing.id },
          data: { count: { increment: 1 } },
          select: { count: true },
        });
        return { userId, usageDate, count: updated.count, limit };
      }

      try {
        const created = await tx.aiUsage.create({
          data: { userId, date: usageDate, count: 1 },
          select: { count: true },
        });
        return { userId, usageDate, count: created.count, limit };
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          const row = await tx.aiUsage.findUnique({
            where: { userId_date: { userId, date: usageDate } },
          });
          if (!row || row.count >= limit) {
            throw ApiError.aiDailyLimitReached(limit);
          }
          const updated = await tx.aiUsage.update({
            where: { id: row.id },
            data: { count: { increment: 1 } },
            select: { count: true },
          });
          return { userId, usageDate, count: updated.count, limit };
        }
        throw error;
      }
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
