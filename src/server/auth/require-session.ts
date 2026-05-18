import { ApiError } from "@/server/http/api-error";
import { getSessionFromCookies, type SessionPayload } from "@/server/auth/session";

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSessionFromCookies();
  if (!session) {
    throw ApiError.unauthorized();
  }
  return session;
}
