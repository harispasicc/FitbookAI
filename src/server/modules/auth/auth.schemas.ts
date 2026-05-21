import { z } from "zod";

export const authRoleSchema = z.enum(["client", "trainer"], {
  error: "role must be either client or trainer",
});

export const registerBodySchema = z.object({
  name: z
    .string({ error: "name must be a string" })
    .trim()
    .min(1, "name is required")
    .max(120, "name cannot exceed 120 characters"),
  email: z
    .string({ error: "email must be a string" })
    .trim()
    .min(1, "email is required")
    .email("email must be a valid address"),
  password: z
    .string({ error: "password must be a string" })
    .min(8, "password must be at least 8 characters")
    .max(128, "password cannot exceed 128 characters"),
  role: authRoleSchema,
});

export const loginBodySchema = z.object({
  email: z
    .string({ error: "email must be a string" })
    .trim()
    .min(1, "email is required")
    .email("email must be a valid address"),
  password: z
    .string({ error: "password must be a string" })
    .min(1, "password is required"),
  expectedRole: authRoleSchema.optional(),
});

export const forgotPasswordBodySchema = z.object({
  email: z
    .string({ error: "email must be a string" })
    .trim()
    .min(1, "email is required")
    .email("email must be a valid address"),
});

export const resetPasswordBodySchema = z.object({
  token: z
    .string({ error: "token must be a string" })
    .trim()
    .min(1, "reset token is required"),
  password: z
    .string({ error: "password must be a string" })
    .min(8, "password must be at least 8 characters")
    .max(128, "password cannot exceed 128 characters"),
});
