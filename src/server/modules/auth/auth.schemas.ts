import { z } from "zod";

export const authRoleSchema = z.enum(["client", "trainer"]);

export const registerBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
  role: authRoleSchema,
});

export const loginBodySchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
  expectedRole: authRoleSchema.optional(),
});
