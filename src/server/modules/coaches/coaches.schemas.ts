import { z } from "zod";

const positiveInt = (label: string, max: number) =>
  z.coerce
    .number({
      error: `${label} must be a number`,
    })
    .int(`${label} must be a whole number`)
    .min(1, `${label} must be at least 1`)
    .max(max, `${label} cannot exceed ${max}`);

export const listCoachesQuerySchema = z.object({
  specialty: z
    .string()
    .trim()
    .min(1, "specialty cannot be empty when provided")
    .optional(),
  limit: positiveInt("limit", 100).default(20),
  offset: z.coerce
    .number({ error: "offset must be a number" })
    .int("offset must be a whole number")
    .min(0, "offset cannot be negative")
    .default(0),
});

export const listReviewsQuerySchema = z.object({
  limit: positiveInt("limit", 50).default(10),
  offset: z.coerce
    .number({ error: "offset must be a number" })
    .int("offset must be a whole number")
    .min(0, "offset cannot be negative")
    .default(0),
});

export const listAvailabilityQuerySchema = z.object({
  from: z.coerce.date({ error: "from must be a valid date (ISO format)" }).optional(),
  to: z.coerce.date({ error: "to must be a valid date (ISO format)" }).optional(),
  serviceId: z
    .string({ error: "serviceId must be a string" })
    .trim()
    .min(1, "serviceId cannot be empty when provided")
    .optional(),
  limit: positiveInt("limit", 50).default(20),
});
