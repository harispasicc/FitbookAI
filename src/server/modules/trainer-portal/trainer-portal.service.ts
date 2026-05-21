import { prisma } from "@/lib/prisma";
import { ApiError } from "@/server/http/api-error";
import { requireTrainerSession } from "@/server/auth/require-session";
import { toBookingDto } from "@/server/modules/bookings/bookings.dto";
import {
  buildWeeklySchedule,
  toTrainerAvailabilitySlotDto,
  toTrainerProfileDto,
  toTrainerServiceDto,
} from "@/server/modules/trainer-portal/trainer-portal.dto";
import {
  computeClientAttendance,
  computeTrainerAnalytics,
  computeTrainerClients,
} from "@/server/modules/trainer-portal/trainer-portal.insights";
import {
  parseTrainerNotificationPrefs,
  toNotificationPrefsJson,
  type TrainerNotificationPrefs,
} from "@/server/email/trainer-notification-prefs";
import { trainerPortalRepository } from "@/server/modules/trainer-portal/trainer-portal.repository";
import { bookingsService } from "@/server/modules/bookings/bookings.service";
import { appPlanToPrisma } from "@/lib/trainer-plans";
import { buildTrainerNotifications } from "@/server/modules/trainer-portal/trainer-portal.notifications";
import { buildTrainerSearchResults } from "@/server/modules/trainer-portal/trainer-portal.search";
import {
  assertTrainerFeature,
  getTrainerPlanContext,
} from "@/server/modules/trainer-portal/trainer-plan.access";
import type {
  createServiceSlotBodySchema,
  createTrainerServiceBodySchema,
  trainerSearchQuerySchema,
  updateTrainerPlanBodySchema,
  updateTrainerProfileBodySchema,
  updateTrainerServiceBodySchema,
  updateWeeklyAvailabilityBodySchema,
  updateTrainerClientNotesBodySchema,
  trainerNotificationPrefsBodySchema,
  markTrainerNotificationsBodySchema,
  calendarSlotsQuerySchema,
} from "@/server/modules/trainer-portal/trainer-portal.schemas";
import type { z } from "zod";

export type UpdateTrainerProfileInput = z.infer<
  typeof updateTrainerProfileBodySchema
>;

export type CreateTrainerServiceInput = z.infer<
  typeof createTrainerServiceBodySchema
>;

export type UpdateTrainerServiceInput = z.infer<
  typeof updateTrainerServiceBodySchema
>;

export type CreateServiceSlotInput = z.infer<typeof createServiceSlotBodySchema>;

export type UpdateWeeklyAvailabilityInput = z.infer<
  typeof updateWeeklyAvailabilityBodySchema
>;

export type TrainerSearchInput = z.infer<typeof trainerSearchQuerySchema>;

export type UpdateTrainerPlanInput = z.infer<typeof updateTrainerPlanBodySchema>;
export type UpdateTrainerClientNotesInput = z.infer<
  typeof updateTrainerClientNotesBodySchema
>;
export type UpdateTrainerNotificationPrefsInput = z.infer<
  typeof trainerNotificationPrefsBodySchema
>;
export type MarkTrainerNotificationsInput = z.infer<
  typeof markTrainerNotificationsBodySchema
>;
export type CalendarSlotsQuery = z.infer<typeof calendarSlotsQuerySchema>;

async function clientNotesMap(trainerProfileId: string) {
  const rows = await trainerPortalRepository.findClientNotesMap(trainerProfileId);
  return new Map(rows.map((r) => [r.clientUserId, r.notes]));
}

function parseTimeToMinutes(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h! * 60 + m!;
}

function validateWeeklyDays(
  days: UpdateWeeklyAvailabilityInput["days"],
) {
  for (const day of days) {
    if (!day.enabled) continue;
    if (parseTimeToMinutes(day.endTime) <= parseTimeToMinutes(day.startTime)) {
      throw ApiError.validation(
        `${day.dayOfWeek}: end time must be after start time`,
      );
    }
  }
}

async function requireTrainerProfile() {
  const session = await requireTrainerSession();
  const profile = await trainerPortalRepository.findProfileByUserId(session.sub);
  if (!profile) {
    throw ApiError.notFound("Trainer profile not found");
  }
  return profile;
}

export const trainerPortalService = {
  async getPlan() {
    const profile = await requireTrainerProfile();
    return getTrainerPlanContext(profile.id, profile.plan);
  },

  async updatePlan(input: UpdateTrainerPlanInput) {
    const profile = await requireTrainerProfile();
    const updated = await trainerPortalRepository.updatePlan(
      profile.id,
      appPlanToPrisma(input.plan),
    );
    return getTrainerPlanContext(profile.id, updated.plan);
  },

  async getProfile() {
    const session = await requireTrainerSession();
    const profile = await trainerPortalRepository.findProfileByUserId(
      session.sub,
    );
    if (!profile) {
      throw ApiError.notFound("Trainer profile not found");
    }
    return toTrainerProfileDto(profile);
  },

  async updateProfile(input: UpdateTrainerProfileInput) {
    const session = await requireTrainerSession();
    const profile = await trainerPortalRepository.findProfileByUserId(
      session.sub,
    );
    if (!profile) {
      throw ApiError.notFound("Trainer profile not found");
    }

    const updated = await trainerPortalRepository.updateProfile(profile.id, {
      ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
      ...(input.specialty !== undefined ? { specialty: input.specialty } : {}),
      ...(input.bio !== undefined ? { bio: input.bio } : {}),
      ...(input.yearsExperience !== undefined
        ? { yearsExperience: input.yearsExperience }
        : {}),
    });

    return toTrainerProfileDto(updated);
  },

  async listServices() {
    const profile = await requireTrainerProfile();
    const services = await trainerPortalRepository.listServices(profile.id);
    return services.map(toTrainerServiceDto);
  },

  async createService(input: CreateTrainerServiceInput) {
    const profile = await requireTrainerProfile();
    const sortOrder = await trainerPortalRepository.getNextServiceSortOrder(
      profile.id,
    );
    const service = await trainerPortalRepository.createService(profile.id, {
      title: input.title,
      description: input.description,
      durationMinutes: input.durationMinutes,
      priceCents: input.priceCents,
      isActive: input.isActive,
      sortOrder,
    });
    return toTrainerServiceDto(service);
  },

  async updateService(serviceId: string, input: UpdateTrainerServiceInput) {
    const profile = await requireTrainerProfile();
    const existing = await trainerPortalRepository.findServiceById(
      profile.id,
      serviceId,
    );
    if (!existing) {
      throw ApiError.notFound("Service not found");
    }

    const updated = await trainerPortalRepository.updateService(serviceId, {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined
        ? { description: input.description || null }
        : {}),
      ...(input.durationMinutes !== undefined
        ? { durationMinutes: input.durationMinutes }
        : {}),
      ...(input.priceCents !== undefined ? { priceCents: input.priceCents } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    });

    return toTrainerServiceDto(updated);
  },

  async listServiceSlots(serviceId: string) {
    const profile = await requireTrainerProfile();
    const service = await trainerPortalRepository.findServiceById(
      profile.id,
      serviceId,
    );
    if (!service) {
      throw ApiError.notFound("Service not found");
    }

    const slots = await trainerPortalRepository.listServiceSlots(
      profile.id,
      serviceId,
    );
    return slots.map(toTrainerAvailabilitySlotDto);
  },

  async createServiceSlot(serviceId: string, input: CreateServiceSlotInput) {
    const profile = await requireTrainerProfile();
    const service = await trainerPortalRepository.findServiceById(
      profile.id,
      serviceId,
    );
    if (!service) {
      throw ApiError.notFound("Service not found");
    }

    const startsAt = input.startsAt;
    const now = new Date();
    if (startsAt.getTime() <= now.getTime()) {
      throw ApiError.validation("Slot must start in the future");
    }

    const endsAt = new Date(
      startsAt.getTime() + service.durationMinutes * 60 * 1000,
    );

    const slot = await trainerPortalRepository.createServiceSlot({
      trainerProfileId: profile.id,
      serviceId: service.id,
      startsAt,
      endsAt,
    });

    return toTrainerAvailabilitySlotDto(slot);
  },

  async deleteServiceSlot(serviceId: string, slotId: string) {
    const profile = await requireTrainerProfile();
    const slot = await trainerPortalRepository.findSlotById(
      profile.id,
      serviceId,
      slotId,
    );
    if (!slot) {
      throw ApiError.notFound("Slot not found");
    }
    if (slot.isBooked) {
      throw ApiError.conflict("Cannot remove a booked slot");
    }

    await trainerPortalRepository.deleteServiceSlot(slotId);
    return { deleted: true };
  },

  async listClients() {
    const profile = await requireTrainerProfile();
    const [bookings, notesRows] = await Promise.all([
      trainerPortalRepository.findAllBookingsForInsights(profile.id),
      trainerPortalRepository.findClientNotesMap(profile.id),
    ]);
    const notesMap = new Map(notesRows.map((r) => [r.clientUserId, r.notes]));
    return computeTrainerClients(bookings, notesMap);
  },

  async getClient(clientUserId: string) {
    const profile = await requireTrainerProfile();
    const bookings = await trainerPortalRepository.findClientBookings(
      profile.id,
      clientUserId,
    );
    if (bookings.length === 0) {
      throw ApiError.notFound("Client not found for this coach");
    }

    const notesMap = await clientNotesMap(profile.id);
    const [client] = computeTrainerClients(bookings, notesMap);
    const attendance = computeClientAttendance(bookings);
    const workoutCount = await prisma.clientWorkout.count({
      where: { clientProfile: { userId: clientUserId } },
    });

    return {
      client,
      bookings: bookings.map(toBookingDto),
      attendance,
      workoutCount,
    };
  },

  async updateClientNotes(
    clientUserId: string,
    input: UpdateTrainerClientNotesInput,
  ) {
    const profile = await requireTrainerProfile();
    const bookings = await trainerPortalRepository.findClientBookings(
      profile.id,
      clientUserId,
    );
    if (bookings.length === 0) {
      throw ApiError.notFound("Client not found for this coach");
    }

    await trainerPortalRepository.upsertClientNote(
      profile.id,
      clientUserId,
      input.notes,
    );

    return this.getClient(clientUserId);
  },

  async getAnalytics() {
    const profile = await requireTrainerProfile();
    assertTrainerFeature(
      profile.plan,
      "analytics",
      "Analytics requires a Pro or AI Pro plan.",
    );
    const bookings = await trainerPortalRepository.findAllBookingsForInsights(
      profile.id,
    );
    return computeTrainerAnalytics(bookings);
  },

  async getSettings() {
    const profile = await requireTrainerProfile();
    const notifications = parseTrainerNotificationPrefs(profile.notificationPrefs);
    return { notifications };
  },

  async updateSettings(input: UpdateTrainerNotificationPrefsInput) {
    const profile = await requireTrainerProfile();
    const current = parseTrainerNotificationPrefs(profile.notificationPrefs);
    const next: TrainerNotificationPrefs = {
      emailNewBooking: input.emailNewBooking ?? current.emailNewBooking,
      emailBookingConfirmed:
        input.emailBookingConfirmed ?? current.emailBookingConfirmed,
      emailBookingCancelled:
        input.emailBookingCancelled ?? current.emailBookingCancelled,
      emailDailyDigest: input.emailDailyDigest ?? current.emailDailyDigest,
    };
    await trainerPortalRepository.updateNotificationPrefs(
      profile.id,
      toNotificationPrefsJson(next),
    );
    return { notifications: next };
  },

  async listNotifications() {
    const session = await requireTrainerSession();
    const profile = await requireTrainerProfile();
    const bookings = await trainerPortalRepository.findAllBookingsForInsights(
      profile.id,
    );
    const items = buildTrainerNotifications(bookings.map(toBookingDto));
    const readRows = await trainerPortalRepository.findNotificationReadIds(
      session.sub,
    );
    const readIds = readRows.map((r) => r.notificationId);
    return { items, readIds };
  },

  async markNotificationsRead(input: MarkTrainerNotificationsInput) {
    const session = await requireTrainerSession();
    const profile = await requireTrainerProfile();
    const bookings = await trainerPortalRepository.findAllBookingsForInsights(
      profile.id,
    );
    const items = buildTrainerNotifications(bookings.map(toBookingDto));

    if (input.markAll) {
      await trainerPortalRepository.markAllNotificationsRead(
        session.sub,
        items.map((i) => i.id),
      );
      return { readIds: items.map((i) => i.id) };
    }

    if (input.notificationId) {
      await trainerPortalRepository.markNotificationRead(
        session.sub,
        input.notificationId,
      );
    }

    const readRows = await trainerPortalRepository.findNotificationReadIds(
      session.sub,
    );
    return { readIds: readRows.map((r) => r.notificationId) };
  },

  async listCalendarSlots(query: CalendarSlotsQuery) {
    const profile = await requireTrainerProfile();
    const slots = await trainerPortalRepository.listOpenSlotsInRange(
      profile.id,
      query.from,
      query.to,
    );
    return slots.map((s) => ({
      id: s.id,
      startsAt: s.startsAt.toISOString(),
      endsAt: s.endsAt.toISOString(),
      serviceId: s.serviceId,
      label: new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(s.startsAt),
    }));
  },

  async search(input: TrainerSearchInput) {
    await requireTrainerProfile();

    const [clients, services, bookingsRes] = await Promise.all([
      this.listClients(),
      this.listServices(),
      bookingsService.listTrainerBookings({ limit: 100, offset: 0 }),
    ]);

    return buildTrainerSearchResults({
      query: input.q,
      limit: input.limit,
      clients,
      services,
      bookings: bookingsRes.items,
    });
  },

  async getWeeklyAvailability() {
    const profile = await requireTrainerProfile();
    const rows = await trainerPortalRepository.listWeeklyAvailability(profile.id);
    return { days: buildWeeklySchedule(rows) };
  },

  async updateWeeklyAvailability(input: UpdateWeeklyAvailabilityInput) {
    const profile = await requireTrainerProfile();
    assertTrainerFeature(
      profile.plan,
      "advancedCalendar",
      "Weekly availability templates require Pro or AI Pro.",
    );
    validateWeeklyDays(input.days);

    const active = input.days
      .filter((d) => d.enabled)
      .map((d) => ({
        dayOfWeek: d.dayOfWeek,
        startTime: d.startTime,
        endTime: d.endTime,
      }));

    await trainerPortalRepository.replaceWeeklyAvailability(profile.id, active);
    const rows = await trainerPortalRepository.listWeeklyAvailability(profile.id);
    return { days: buildWeeklySchedule(rows) };
  },
};
