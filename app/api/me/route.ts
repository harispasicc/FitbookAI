import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/server/auth/constants";
import { handleRoute, jsonOk } from "@/server/http/response";
import {
  clearSessionCookie,
  getSessionFromCookies,
} from "@/server/auth/session";
import { authService } from "@/server/modules/auth/auth.service";

export async function GET() {
  return handleRoute(async () => {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    const session = await getSessionFromCookies();
    if (!session) {
      if (rawToken) {
        const response = jsonOk(null);
        clearSessionCookie(response);
        return response;
      }
      return jsonOk(null);
    }

    const user = await authService.getCurrentUser(session.sub);
    return jsonOk(user);
  });
}
