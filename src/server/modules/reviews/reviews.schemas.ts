import { z } from "zod";

export const createBookingReviewBodySchema = z.object({
  rating: z
    .number({ error: "rating must be a number" })
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  comment: z
    .string()
    .trim()
    .max(1000, "Comment cannot exceed 1000 characters")
    .optional(),
});

export const bookingIdParamSchema = z.object({
  id: z
    .string({ error: "booking id must be a string" })
    .trim()
    .min(1, "booking id is required"),
});
