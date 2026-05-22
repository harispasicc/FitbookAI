import { ApiError } from "@/server/http/api-error";
import {
  requireClientSession,
  requireTrainerSession,
} from "@/server/auth/require-session";
import { assertAndConsumeAiUsage } from "@/server/ai/ai-usage.service";
import {
  createChatCompletion,
  isOpenAiConfigured,
  runChatWithTools,
  type ChatMessage,
} from "@/server/ai/openai-client";
import {
  clientAssistantFallback,
  trainerToolFallback,
} from "@/server/modules/ai/ai.fallback";
import {
  CLIENT_AI_TOOL_DEFINITIONS,
  executeClientAiTool,
} from "@/server/modules/ai/client-ai-tools";
import type { ClientKnowledgeBase } from "@/server/modules/ai/client-knowledge";
import { toAiReplyDto } from "@/server/modules/ai/ai.dto";
import { aiRepository } from "@/server/modules/ai/ai.repository";
import {
  CLIENT_ASSISTANT_SYSTEM,
  TRAINER_TOOL_SYSTEM,
} from "@/server/modules/ai/ai.prompts";
import type {
  clientAssistantBodySchema,
  trainerToolBodySchema,
} from "@/server/modules/ai/ai.schemas";
import type { z } from "zod";

export type ClientAssistantInput = z.infer<typeof clientAssistantBodySchema>;
export type TrainerToolInput = z.infer<typeof trainerToolBodySchema>;

function formatClientKnowledgeBlock(knowledge: ClientKnowledgeBase) {
  return JSON.stringify(knowledge, null, 2);
}

async function runClientAssistantChat(
  userId: string,
  input: ClientAssistantInput,
  knowledge: ClientKnowledgeBase,
) {
  const history: ChatMessage[] = (input.history ?? []).slice(-12).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const baseMessages: ChatMessage[] = [
    { role: "system", content: CLIENT_ASSISTANT_SYSTEM },
    {
      role: "system",
      content: `Client knowledge base (JSON):\n${formatClientKnowledgeBlock(knowledge)}`,
    },
    ...history,
    { role: "user", content: input.message },
  ];

  if (!isOpenAiConfigured()) {
    return toAiReplyDto(clientAssistantFallback(input.message, knowledge), "fallback");
  }

  try {
    const reply = await runChatWithTools({
      messages: baseMessages,
      tools: CLIENT_AI_TOOL_DEFINITIONS,
      executeTool: (name, args) => executeClientAiTool(userId, name, args),
      maxTokens: 1200,
      temperature: 0.5,
    });
    return toAiReplyDto(reply, "openai");
  } catch {
    return toAiReplyDto(
      clientAssistantFallback(input.message, knowledge, {
        openAiUnavailable: true,
      }),
      "fallback",
    );
  }
}

function formatTrainerContextBlock(
  context: NonNullable<Awaited<ReturnType<typeof aiRepository.getTrainerContext>>>,
  clientName?: string,
) {
  return JSON.stringify({ ...context, focusClient: clientName ?? null }, null, 2);
}

async function runChat(
  messages: ChatMessage[],
  fallback: () => string,
) {
  if (!isOpenAiConfigured()) {
    return toAiReplyDto(fallback(), "fallback");
  }

  try {
    const reply = await createChatCompletion(messages);
    return toAiReplyDto(reply, "openai");
  } catch {
    return toAiReplyDto(fallback(), "fallback");
  }
}

export const aiService = {
  async clientAssistant(input: ClientAssistantInput) {
    const session = await requireClientSession();
    await assertAndConsumeAiUsage(session);

    const knowledge = await aiRepository.getClientContext(session.sub);

    if (!knowledge) {
      throw ApiError.notFound("Client profile not found");
    }

    return runClientAssistantChat(session.sub, input, knowledge);
  },

  async trainerTool(input: TrainerToolInput) {
    const session = await requireTrainerSession();
    const { assertTrainerFeature } = await import(
      "@/server/modules/trainer-portal/trainer-plan.access"
    );
    const { prisma } = await import("@/lib/prisma");
    const trainerProfile = await prisma.trainerProfile.findUnique({
      where: { userId: session.sub },
      select: { plan: true },
    });
    if (!trainerProfile) {
      throw ApiError.notFound("Trainer profile not found");
    }
    assertTrainerFeature(
      trainerProfile.plan,
      "aiAssistant",
      "AI Assistant requires a Pro or AI Pro plan.",
    );
    await assertAndConsumeAiUsage(session);

    const context = await aiRepository.getTrainerContext(session.sub);

    if (!context) {
      throw ApiError.notFound("Trainer profile not found");
    }

    const systemPrompt = TRAINER_TOOL_SYSTEM[input.tool];
    const userContent = [
      input.clientName ? `Client name: ${input.clientName}` : null,
      `Coach brief:\n${input.prompt}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      {
        role: "system",
        content: `Workspace context (JSON):\n${formatTrainerContextBlock(context, input.clientName)}`,
      },
      { role: "user", content: userContent },
    ];

    return runChat(messages, () =>
      trainerToolFallback(input.tool, input.prompt, input.clientName),
    );
  },
};
