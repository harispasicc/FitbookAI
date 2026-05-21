import type { ApiValidationIssue } from "@/lib/auth-api";
import { apiFetch } from "@/lib/api-fetch";
import { CLIENT_AI_DAILY_MESSAGE_LIMIT } from "@/lib/ai-constants";

export type AiChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type TrainerToolType =
  | "generate_workout"
  | "generate_reminder"
  | "summarize_progress"
  | "reengagement_message";

export type AiReply = {
  reply: string;
  source: "openai" | "fallback";
};

type ApiErrorBody = {
  error?:
    | {
        message?: string;
        code?: string;
        details?: { issues?: ApiValidationIssue[]; limit?: number };
      }
    | string;
};

export type AiApiErrorCode = "AI_DAILY_LIMIT" | "UNAUTHORIZED" | "UNKNOWN";

async function readApiError(res: Response): Promise<{
  message: string;
  code?: AiApiErrorCode;
  limit?: number;
  issues?: ApiValidationIssue[];
}> {
  try {
    const body = (await res.json()) as ApiErrorBody;
    const err = body.error;
    if (typeof err === "string") {
      return {
        message: err,
        code: res.status === 429 ? "AI_DAILY_LIMIT" : undefined,
        limit: res.status === 429 ? CLIENT_AI_DAILY_MESSAGE_LIMIT : undefined,
      };
    }
    return {
      message: err?.message ?? "Request failed",
      code: err?.code as AiApiErrorCode | undefined,
      limit: err?.details?.limit,
      issues: err?.details?.issues,
    };
  } catch {
    return { message: "Request failed" };
  }
}

function mapAiClientError(
  res: Response,
  err: {
    message: string;
    code?: AiApiErrorCode;
    limit?: number;
    issues?: ApiValidationIssue[];
  },
): {
  message: string;
  code?: AiApiErrorCode;
  issues?: ApiValidationIssue[];
} {
  if (res.status === 429 || err.code === "AI_DAILY_LIMIT") {
    const limit = err.limit ?? CLIENT_AI_DAILY_MESSAGE_LIMIT;
    return {
      code: "AI_DAILY_LIMIT",
      message: `You have used all ${limit} FitBook AI messages for today. Your limit resets tomorrow (UTC).`,
      issues: err.issues,
    };
  }

  if (res.status === 401 || err.message === "Unauthorized") {
    return {
      code: "UNAUTHORIZED",
      message: "Your session expired. Sign in again at /login, then retry.",
      issues: err.issues,
    };
  }

  if (res.status === 400) {
    const historyIssue = err.issues?.some(
      (i) => i.field === "history" || i.message.toLowerCase().includes("array"),
    );
    return {
      message: historyIssue
        ? "This chat thread is too long. Sign out and back in to reset chat, or try again tomorrow."
        : "Could not send your message. Try shorter text and send again.",
      issues: err.issues,
    };
  }

  if (
    err.message.toLowerCase().includes("too big") ||
    err.message.toLowerCase().includes("expected array")
  ) {
    return {
      message:
        "This chat thread is too long. Sign out and back in to reset chat, or try again tomorrow.",
      issues: err.issues,
    };
  }

  return {
    message: "Could not get an AI reply. Please try again in a moment.",
    issues: err.issues,
  };
}

export async function apiClientAssistant(input: {
  message: string;
  history?: AiChatMessage[];
}): Promise<
  | { ok: true; data: AiReply }
  | {
      ok: false;
      message: string;
      code?: AiApiErrorCode;
      issues?: ApiValidationIssue[];
    }
> {
  const res = await apiFetch("/api/ai/client-assistant", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = mapAiClientError(res, await readApiError(res));
    return {
      ok: false,
      message: err.message,
      code: err.code,
      issues: err.issues,
    };
  }

  const body = (await res.json()) as { data: AiReply };
  return { ok: true, data: body.data };
}

export async function apiTrainerTool(input: {
  tool: TrainerToolType;
  prompt: string;
  clientName?: string;
}): Promise<
  | { ok: true; data: AiReply }
  | {
      ok: false;
      message: string;
      code?: AiApiErrorCode;
      issues?: ApiValidationIssue[];
    }
> {
  const res = await apiFetch("/api/ai/trainer-tool", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = mapAiClientError(res, await readApiError(res));
    return {
      ok: false,
      message: err.message ?? "Could not run AI tool",
      code: err.code,
      issues: err.issues,
    };
  }

  const body = (await res.json()) as { data: AiReply };
  return { ok: true, data: body.data };
}

export const TRAINER_TOOL_LABELS: Record<
  TrainerToolType,
  { title: string; description: string }
> = {
  generate_workout: {
    title: "Generate workout",
    description: "Structured plan from goals, equipment, and schedule.",
  },
  generate_reminder: {
    title: "Generate reminder",
    description: "Session reminder in your preferred tone.",
  },
  summarize_progress: {
    title: "Summarize progress",
    description: "Coach brief from recent bookings and notes.",
  },
  reengagement_message: {
    title: "Re-engagement message",
    description: "Win-back message for inactive clients.",
  },
};
