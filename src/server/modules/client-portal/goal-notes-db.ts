import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function readGoalCustomNotes(
  clientProfileId: string,
): Promise<Prisma.JsonValue | null> {
  try {
    const rows = await prisma.$queryRaw<{ customNotes: Prisma.JsonValue | null }[]>`
      SELECT "customNotes" FROM "ClientGoals"
      WHERE "clientProfileId" = ${clientProfileId}
      LIMIT 1
    `;
    return rows[0]?.customNotes ?? null;
  } catch {
    return null;
  }
}

export async function writeGoalCustomNotes(
  clientProfileId: string,
  notes: Prisma.InputJsonValue,
) {
  const json = JSON.stringify(notes);
  await prisma.$executeRawUnsafe(
    `UPDATE "ClientGoals" SET "customNotes" = $1::jsonb, "updatedAt" = NOW() WHERE "clientProfileId" = $2`,
    json,
    clientProfileId,
  );
}
