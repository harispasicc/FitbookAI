import {
  isUnauthorizedStatus,
  notifyAuthSessionExpired,
} from "@/lib/auth-session-events";

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, {
    credentials: "include",
    ...init,
  });
  if (isUnauthorizedStatus(res.status)) {
    notifyAuthSessionExpired();
  }
  return res;
}
