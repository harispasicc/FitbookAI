import { ApiError } from "@/server/http/api-error";

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type OpenAiToolDefinition = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

type OpenAiToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

type OpenAiAssistantMessage = {
  role: "assistant";
  content: string | null;
  tool_calls?: OpenAiToolCall[];
};

type OpenAiRequestMessage =
  | ChatMessage
  | OpenAiAssistantMessage
  | {
      role: "tool";
      tool_call_id: string;
      content: string;
    };

function getOpenAiConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  return { apiKey, model };
}

export function isOpenAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function createChatCompletion(
  messages: ChatMessage[],
  options?: { maxTokens?: number; temperature?: number },
): Promise<string> {
  const { apiKey, model } = getOpenAiConfig();

  if (!apiKey) {
    throw ApiError.internal("OpenAI API key is not configured");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.6,
      max_tokens: options?.maxTokens ?? 900,
    }),
  });

  if (!res.ok) {
    let detail = `OpenAI request failed (${res.status})`;
    try {
      const body = (await res.json()) as {
        error?: { message?: string };
      };
      if (body.error?.message) {
        detail = body.error.message;
      }
    } catch {
    }
    throw ApiError.internal(detail);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw ApiError.internal("OpenAI returned an empty response");
  }

  return content;
}

const MAX_TOOL_ROUNDS = 5;

export async function runChatWithTools(input: {
  messages: OpenAiRequestMessage[];
  tools: OpenAiToolDefinition[];
  executeTool: (name: string, args: string) => Promise<string>;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const { apiKey, model } = getOpenAiConfig();

  if (!apiKey) {
    throw ApiError.internal("OpenAI API key is not configured");
  }

  const conversation: OpenAiRequestMessage[] = [...input.messages];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: conversation,
        tools: input.tools,
        tool_choice: "auto",
        temperature: input.temperature ?? 0.5,
        max_tokens: input.maxTokens ?? 1200,
      }),
    });

    if (!res.ok) {
      let detail = `OpenAI request failed (${res.status})`;
      try {
        const body = (await res.json()) as { error?: { message?: string } };
        if (body.error?.message) detail = body.error.message;
      } catch {
        /* ignore */
      }
      throw ApiError.internal(detail);
    }

    const data = (await res.json()) as {
      choices?: { message?: OpenAiAssistantMessage }[];
    };

    const message = data.choices?.[0]?.message;
    if (!message) {
      throw ApiError.internal("OpenAI returned an empty response");
    }

    const toolCalls = message.tool_calls ?? [];
    if (toolCalls.length === 0) {
      const text = message.content?.trim();
      if (!text) {
        throw ApiError.internal("OpenAI returned an empty response");
      }
      return text;
    }

    conversation.push({
      role: "assistant",
      content: message.content,
      tool_calls: toolCalls,
    });

    for (const call of toolCalls) {
      const result = await input.executeTool(
        call.function.name,
        call.function.arguments ?? "{}",
      );
      conversation.push({
        role: "tool",
        tool_call_id: call.id,
        content: result,
      });
    }
  }

  throw ApiError.internal("OpenAI tool loop exceeded maximum rounds");
}
