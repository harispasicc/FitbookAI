import { z } from "zod";

export const bookingStatusSchema = z.enum([
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

export const createBookingBodySchema = z.object({
  trainerProfileId: z
    .string({ error: "trainerProfileId must be a string" })
    .trim()
    .min(1, "trainerProfileId is required"),
  serviceId: z
    .string({ error: "serviceId must be a string" })
    .trim()
    .min(1, "serviceId is required"),
  availabilitySlotId: z
    .string({ error: "availabilitySlotId must be a string" })
    .trim()
    .min(1, "availabilitySlotId is required"),
  notes: z
    .string({ error: "notes must be a string" })
    .trim()
    .max(500, "notes cannot exceed 500 characters")
    .optional(),
});

export const updateBookingBodySchema = z
  .object({
    status: bookingStatusSchema.optional(),
    availabilitySlotId: z
      .string({ error: "availabilitySlotId must be a string" })
      .trim()
      .min(1, "availabilitySlotId is required")
      .optional(),
  })
  .refine((data) => data.status !== undefined || data.availabilitySlotId !== undefined, {
    message: "Provide status or availabilitySlotId",
  })
  .refine((data) => !(data.status && data.availabilitySlotId), {
    message: "Provide only status or availabilitySlotId, not both",
  });

export const listBookingsQuerySchema = z.object({
  status: bookingStatusSchema.optional(),
  from: z.coerce.date({ error: "from must be a valid date (ISO format)" }).optional(),
  to: z.coerce.date({ error: "to must be a valid date (ISO format)" }).optional(),
  limit: z.coerce
    .number({ error: "limit must be a number" })
    .int("limit must be a whole number")
    .min(1, "limit must be at least 1")
    .max(100, "limit cannot exceed 100")
    .default(20),
  offset: z.coerce
    .number({ error: "offset must be a number" })
    .int("offset must be a whole number")
    .min(0, "offset cannot be negative")
    .default(0),
});

export const bookingIdParamSchema = z.object({
  id: z
    .string({ error: "booking id must be a string" })
    .trim()
    .min(1, "booking id is required"),
});
