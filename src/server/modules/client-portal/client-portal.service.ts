import { ApiError } from "@/server/http/api-error";
import { requireClientSession } from "@/server/auth/require-session";
import {
  apiGoalToPrisma,
  toClientCoachDto,
  toClientGoalsDto,
  toClientNotificationDto,
  toClientProfileDto,
  toClientWorkoutDto,
} from "@/server/modules/client-portal/client-portal.dto";
import { mergeGoalNotes } from "@/server/modules/client-portal/goal-notes";
import { clientPortalRepository } from "@/server/modules/client-portal/client-portal.repository";
import type {
  listWorkoutsQuerySchema,
  updateGoalsBodySchema,
  updateProfileBodySchema,
} from "@/server/modules/client-portal/client-portal.schemas";
import type { z } from "zod";

export type UpdateProfileInput = z.infer<typeof updateProfileBodySchema>;
export type UpdateGoalsInput = z.infer<typeof updateGoalsBodySchema>;
export type ListWorkoutsQuery = z.infer<typeof listWorkoutsQuerySchema>;

async function requireClientProfile() {
  const session = await requireClientSession();
  const profile = await clientPortalRepository.findProfileByUserId(session.sub);

  if (!profile) {
    throw ApiError.notFound("Client profile not found");
  }

  return { session, profile };
}

export const clientPortalService = {
  async getProfile() {
    const { profile } = await requireClientProfile();
    return toClientProfileDto(profile);
  },

  async updateProfile(input: UpdateProfileInput) {
    const { profile } = await requireClientProfile();

    if (input.selectedTrainerProfileId) {
      const coach = await clientPortalRepository.findSelectedCoach(
        input.selectedTrainerProfileId,
      );
      if (!coach) {
        throw ApiError.notFound("Coach not found");
      }
    }

    const updated = await clientPortalRepository.updateProfile(profile.id, {
      ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
      ...(input.headline !== undefined ? { headline: input.headline } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.city !== undefined ? { city: input.city } : {}),
      ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
      ...(input.bio !== undefined ? { bio: input.bio } : {}),
      ...(input.selectedTrainerProfileId !== undefined
        ? { selectedTrainerProfileId: input.selectedTrainerProfileId }
        : {}),
    });

    return toClientProfileDto(updated);
  },

  async getCoach() {
    const { profile } = await requireClientProfile();

    if (!profile.selectedTrainerProfileId) {
      return null;
    }

    const coach = await clientPortalRepository.findSelectedCoach(
      profile.selectedTrainerProfileId,
    );

    if (!coach) {
      return null;
    }

    const ratings = coach.reviews.map((r) => r.rating);
    const averageRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) /
          10
        : null;

    return toClientCoachDto(coach, {
      averageRating,
      reviewCount: ratings.length,
    });
  },

  async getGoals() {
    const { profile } = await requireClientProfile();
    const goals = await clientPortalRepository.findOrCreateGoals(profile.id);
    return toClientGoalsDto(goals);
  },

  async updateGoals(input: UpdateGoalsInput) {
    const { profile } = await requireClientProfile();
    const existing = await clientPortalRepository.findOrCreateGoals(profile.id);

    const notesJson =
      input.notes !== undefined
        ? mergeGoalNotes(existing.customNotes, input.notes)
        : undefined;

    const updated = await clientPortalRepository.updateGoals(profile.id, {
      ...(input.active ? { activeGoal: apiGoalToPrisma(input.active) } : {}),
      ...(input.pct?.lose !== undefined ? { pctLose: input.pct.lose } : {}),
      ...(input.pct?.muscle !== undefined ? { pctMuscle: input.pct.muscle } : {}),
      ...(input.pct?.conditioning !== undefined
        ? { pctConditioning: input.pct.conditioning }
        : {}),
      ...(input.pct?.rehab !== undefined ? { pctRehab: input.pct.rehab } : {}),
      ...(input.notes !== undefined ? { customNotes: notesJson ?? {} } : {}),
    });

    return toClientGoalsDto(updated);
  },

  async listWorkouts(query: ListWorkoutsQuery) {
    const { profile } = await requireClientProfile();
    const [workouts, total] = await clientPortalRepository.findWorkouts(
      profile.id,
      query,
    );

    return {
      items: workouts.map(toClientWorkoutDto),
      meta: { total, limit: query.limit, offset: query.offset },
    };
  },

  async listNotifications() {
    const { profile } = await requireClientProfile();
    const notifications = await clientPortalRepository.findNotifications(
      profile.id,
    );
    return notifications.map(toClientNotificationDto);
  },

  async markNotificationRead(notificationId: string) {
    const { profile } = await requireClientProfile();
    const existing = await clientPortalRepository.findNotificationForClient(
      profile.id,
      notificationId,
    );

    if (!existing) {
      throw ApiError.notFound("Notification not found");
    }

    const updated = await clientPortalRepository.markNotificationRead(
      notificationId,
    );
    return toClientNotificationDto(updated);
  },
};
