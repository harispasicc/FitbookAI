import { z } from "zod";

export const chatRoleSchema = z.enum(["user", "assistant"]);

export const chatMessageSchema = z.object({
  role: chatRoleSchema,
  content: z
    .string({ error: "content must be a string" })
    .trim()
    .min(1, "content cannot be empty")
    .max(4000, "content cannot exceed 4000 characters"),
});

export const clientAssistantBodySchema = z.object({
  message: z
    .string({ error: "message must be a string" })
    .trim()
    .min(1, "message is required")
    .max(2000, "message cannot exceed 2000 characters"),
  history: z.array(chatMessageSchema).max(20).optional(),
});

export const trainerToolTypeSchema = z.enum([
  "generate_workout",
  "generate_reminder",
  "summarize_progress",
  "reengagement_message",
]);

export type TrainerToolType = z.infer<typeof trainerToolTypeSchema>;

export const trainerToolBodySchema = z.object({
  tool: trainerToolTypeSchema,
  prompt: z
    .string({ error: "prompt must be a string" })
    .trim()
    .min(1, "prompt is required")
    .max(4000, "prompt cannot exceed 4000 characters"),
  clientName: z
    .string({ error: "clientName must be a string" })
    .trim()
    .max(120, "clientName cannot exceed 120 characters")
    .optional(),
});
