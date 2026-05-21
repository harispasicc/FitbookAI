export type AiReplySource = "openai" | "fallback";

export function toAiReplyDto(reply: string, source: AiReplySource) {
  return {
    reply,
    source,
  };
}
