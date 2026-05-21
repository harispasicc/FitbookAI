import { z } from "zod";

export const goalKeySchema = z.enum(["lose", "muscle", "conditioning", "rehab"]);

export const updateProfileBodySchema = z.object({
  fullName: z
    .string({ error: "fullName must be a string" })
    .trim()
    .min(1, "fullName cannot be empty")
    .max(120, "fullName cannot exceed 120 characters")
    .optional(),
  headline: z
    .string({ error: "headline must be a string" })
    .trim()
    .max(200, "headline cannot exceed 200 characters")
    .optional(),
  phone: z
    .string({ error: "phone must be a string" })
    .trim()
    .max(40, "phone cannot exceed 40 characters")
    .optional(),
  city: z
    .string({ error: "city must be a string" })
    .trim()
    .max(120, "city cannot exceed 120 characters")
    .optional(),
  timezone: z
    .string({ error: "timezone must be a string" })
    .trim()
    .min(1, "timezone cannot be empty")
    .max(80, "timezone cannot exceed 80 characters")
    .optional(),
  bio: z
    .string({ error: "bio must be a string" })
    .trim()
    .max(2000, "bio cannot exceed 2000 characters")
    .optional(),
  selectedTrainerProfileId: z
    .string({ error: "selectedTrainerProfileId must be a string" })
    .trim()
    .min(1, "selectedTrainerProfileId cannot be empty")
    .nullable()
    .optional(),
});

const goalNotesPatchSchema = z
  .object({
    lose: z.string().trim().max(500).optional(),
    muscle: z.string().trim().max(500).optional(),
    conditioning: z.string().trim().max(500).optional(),
    rehab: z.string().trim().max(500).optional(),
  })
  .optional();

export const updateGoalsBodySchema = z
  .object({
    active: goalKeySchema.optional(),
    pct: z
      .object({
        lose: z.coerce.number().int().min(0).max(100).optional(),
        muscle: z.coerce.number().int().min(0).max(100).optional(),
        conditioning: z.coerce.number().int().min(0).max(100).optional(),
        rehab: z.coerce.number().int().min(0).max(100).optional(),
      })
      .optional(),
    notes: goalNotesPatchSchema,
  })
  .refine(
    (v) => v.active !== undefined || v.pct !== undefined || v.notes !== undefined,
    {
      message: "Provide active goal, pct, and/or notes updates",
    },
  );

export const listWorkoutsQuerySchema = z.object({
  type: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const notificationIdParamSchema = z.object({
  id: z
    .string({ error: "notification id must be a string" })
    .trim()
    .min(1, "notification id is required"),
});

export const patchNotificationBodySchema = z.object({
  read: z.literal(true, { error: "read must be true when marking as read" }),
});
