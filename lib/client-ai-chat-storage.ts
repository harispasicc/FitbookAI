import type { ClientChatMessage } from "@/components/client/client-ai-assistant-panel";

const KEY_PREFIX = "fitbook-client-ai-chat";

function storageKey(userId: string) {
  return `${KEY_PREFIX}:${userId}`;
}

export function loadClientAiChat(userId: string): ClientChatMessage[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ClientChatMessage[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function saveClientAiChat(userId: string, messages: ClientChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(storageKey(userId), JSON.stringify(messages));
  } catch {
  }
}

export function clearClientAiChat(userId?: string) {
  if (typeof window === "undefined") return;
  if (userId) {
    window.sessionStorage.removeItem(storageKey(userId));
    return;
  }
  for (let i = window.sessionStorage.length - 1; i >= 0; i--) {
    const key = window.sessionStorage.key(i);
    if (key?.startsWith(`${KEY_PREFIX}:`)) {
      window.sessionStorage.removeItem(key);
    }
  }
}
