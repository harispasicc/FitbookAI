import type { SessionPayload } from "@/server/auth/session";
import type { UserRole } from "@prisma/client";

export const AI_DAILY_LIMIT_BY_ROLE = {
  CLIENT: 10,
  TRAINER: 20,
} as const satisfies Record<UserRole, number>;

export function getDailyAiLimitForSessionRole(
  role: SessionPayload["role"],
): number {
  return role === "client"
    ? AI_DAILY_LIMIT_BY_ROLE.CLIENT
    : AI_DAILY_LIMIT_BY_ROLE.TRAINER;
}

export function getDailyAiLimitForPrismaRole(role: UserRole): number {
  return AI_DAILY_LIMIT_BY_ROLE[role];
}
