import type {
  ClientGoals,
  ClientNotification,
  ClientProfile,
  ClientWorkout,
  NotificationTone,
  TrainerProfile,
  User,
} from "@prisma/client";
import type { ClientGoalKey } from "@prisma/client";
import { parseGoalNotes } from "@/server/modules/client-portal/goal-notes";

export type AppGoalKey = "lose" | "muscle" | "conditioning" | "rehab";
export type AppNotificationTone = "info" | "success" | "warning" | "neutral";

const GOAL_LABELS: Record<AppGoalKey, string> = {
  lose: "Lose weight",
  muscle: "Build muscle",
  conditioning: "Improve conditioning",
  rehab: "Rehab / mobility",
};

export function prismaGoalToApi(key: ClientGoalKey): AppGoalKey {
  return key.toLowerCase() as AppGoalKey;
}

export function apiGoalToPrisma(key: AppGoalKey): ClientGoalKey {
  return key.toUpperCase() as ClientGoalKey;
}

export function prismaToneToApi(tone: NotificationTone): AppNotificationTone {
  return tone.toLowerCase() as AppNotificationTone;
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type ProfileWithUser = ClientProfile & {
  user: Pick<User, "id" | "email">;
};

export function toClientProfileDto(profile: ProfileWithUser) {
  return {
    id: profile.id,
    userId: profile.userId,
    email: profile.user.email,
    fullName: profile.fullName,
    headline: profile.headline ?? "",
    phone: profile.phone ?? "",
    city: profile.city ?? "",
    timezone: profile.timezone ?? "Europe/Sarajevo",
    bio: profile.bio ?? "",
    selectedTrainerProfileId: profile.selectedTrainerProfileId,
  };
}

export function toClientGoalsDto(goals: ClientGoals) {
  const active = prismaGoalToApi(goals.activeGoal);
  const notes = parseGoalNotes(goals.customNotes);
  return {
    active,
    activeLabel: GOAL_LABELS[active],
    pct: {
      lose: goals.pctLose,
      muscle: goals.pctMuscle,
      conditioning: goals.pctConditioning,
      rehab: goals.pctRehab,
    },
    notes,
    updatedAt: goals.updatedAt.toISOString(),
  };
}

export function toClientWorkoutDto(workout: ClientWorkout) {
  return {
    id: workout.id,
    date: workout.workoutDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    workoutDate: workout.workoutDate.toISOString(),
    type: workout.type,
    durationMin: workout.durationMin,
    calories: workout.calories,
    trainerNote: workout.trainerNote ?? "",
  };
}

export function toClientNotificationDto(notification: ClientNotification) {
  return {
    id: notification.id,
    title: notification.title,
    body: notification.body,
    tone: prismaToneToApi(notification.tone),
    timeLabel: formatRelativeTime(notification.createdAt),
    read: notification.readAt !== null,
    readAt: notification.readAt?.toISOString() ?? null,
    createdAt: notification.createdAt.toISOString(),
  };
}

export function toClientCoachDto(
  trainer: TrainerProfile & {
    user: Pick<User, "email">;
    services: { id: string; title: string; isActive: boolean }[];
  },
  stats: { averageRating: number | null; reviewCount: number },
) {
  return {
    id: trainer.id,
    fullName: trainer.fullName,
    specialty: trainer.specialty,
    bio: trainer.bio,
    email: trainer.user.email,
    stats,
    activeServicesCount: trainer.services.filter((s) => s.isActive).length,
  };
}
