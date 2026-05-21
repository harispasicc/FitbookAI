import { z } from "zod";

export const updateTrainerPlanBodySchema = z.object({
  plan: z.enum(["free", "pro", "ai_pro"]),
});

export const updateTrainerProfileBodySchema = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  specialty: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(2000).optional(),
  yearsExperience: z
    .number({ error: "yearsExperience must be a number" })
    .int()
    .min(0)
    .max(60)
    .optional(),
});

export const trainerServiceIdParamSchema = z.object({
  id: z
    .string({ error: "service id must be a string" })
    .trim()
    .min(1, "service id is required"),
});

export const createTrainerServiceBodySchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(2000).optional(),
  durationMinutes: z
    .number({ error: "durationMinutes must be a number" })
    .int()
    .min(15, "Minimum duration is 15 minutes")
    .max(480, "Maximum duration is 8 hours"),
  priceCents: z
    .number({ error: "priceCents must be a number" })
    .int()
    .min(0, "Price cannot be negative")
    .max(1_000_000, "Price is too high"),
  isActive: z.boolean().optional(),
});

export const updateTrainerServiceBodySchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(2000).optional(),
  durationMinutes: z.number().int().min(15).max(480).optional(),
  priceCents: z.number().int().min(0).max(1_000_000).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

export const createServiceSlotBodySchema = z.object({
  startsAt: z.coerce.date({ error: "startsAt must be a valid date (ISO format)" }),
});

export const weeklyDaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  enabled: z.boolean(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "startTime must be HH:MM"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "endTime must be HH:MM"),
});

export const updateWeeklyAvailabilityBodySchema = z.object({
  days: z.array(weeklyDaySchema).length(7, "Provide all 7 days"),
  sessionBufferMinutes: z.number().int().min(0).max(120).optional(),
  defaultLocation: z.string().trim().max(200).optional(),
});

export const trainerClientIdParamSchema = z.object({
  id: z
    .string({ error: "client id must be a string" })
    .trim()
    .min(1, "client id is required"),
});

export const updateTrainerClientNotesBodySchema = z.object({
  notes: z.string().trim().max(8000),
});

export const trainerNotificationPrefsBodySchema = z.object({
  emailNewBooking: z.boolean().optional(),
  emailBookingConfirmed: z.boolean().optional(),
  emailBookingCancelled: z.boolean().optional(),
  emailDailyDigest: z.boolean().optional(),
});

export const markTrainerNotificationsBodySchema = z.object({
  notificationId: z.string().trim().min(1).optional(),
  markAll: z.boolean().optional(),
});

export const calendarSlotsQuerySchema = z.object({
  from: z.coerce.date({ error: "from must be a valid ISO date" }),
  to: z.coerce.date({ error: "to must be a valid ISO date" }),
});

export const trainerSearchQuerySchema = z.object({
  q: z
    .string({ error: "q must be a string" })
    .trim()
    .min(1, "Enter a search term")
    .max(100, "Search term is too long"),
  limit: z.coerce
    .number({ error: "limit must be a number" })
    .int()
    .min(1)
    .max(30)
    .default(12),
});

export const serviceSlotIdParamSchema = z.object({
  id: z
    .string({ error: "service id must be a string" })
    .trim()
    .min(1, "service id is required"),
  slotId: z
    .string({ error: "slot id must be a string" })
    .trim()
    .min(1, "slot id is required"),
});
