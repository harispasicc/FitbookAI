import type { Prisma } from "@prisma/client";
import type { AppGoalKey } from "@/server/modules/client-portal/client-portal.dto";

export type GoalNotesMap = Partial<Record<AppGoalKey, string>>;

const GOAL_KEYS: AppGoalKey[] = ["lose", "muscle", "conditioning", "rehab"];

export function parseGoalNotes(raw: Prisma.JsonValue | null | undefined): GoalNotesMap {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const o = raw as Record<string, unknown>;
  const out: GoalNotesMap = {};
  for (const key of GOAL_KEYS) {
    const v = o[key];
    if (typeof v === "string" && v.trim()) {
      out[key] = v.trim();
    }
  }
  return out;
}

export function mergeGoalNotes(
  current: Prisma.JsonValue | null | undefined,
  patch: GoalNotesMap | undefined,
): Prisma.InputJsonValue | undefined {
  if (!patch) return undefined;
  const merged: GoalNotesMap = { ...parseGoalNotes(current) };
  for (const key of GOAL_KEYS) {
    if (patch[key] === undefined) continue;
    const trimmed = patch[key]?.trim() ?? "";
    if (trimmed) merged[key] = trimmed;
    else delete merged[key];
  }
  if (Object.keys(merged).length === 0) {
    return {};
  }
  return merged;
}
