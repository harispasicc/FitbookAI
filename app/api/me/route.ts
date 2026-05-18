import { ApiError } from "@/server/http/api-error";
import { handleRoute, jsonOk } from "@/server/http/response";
import { getSessionFromCookies } from "@/server/auth/session";
import { authService } from "@/server/modules/auth/auth.service";

export async function GET() {
  return handleRoute(async () => {
    const session = await getSessionFromCookies();
    if (!session) {
      throw ApiError.unauthorized();
    }

    const user = await authService.getCurrentUser(session.sub);
    if (!user) {
      throw ApiError.unauthorized();
    }

    return jsonOk(user);
  });
}
