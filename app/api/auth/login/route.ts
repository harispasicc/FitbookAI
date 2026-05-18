import { handleRoute, jsonOk } from "@/server/http/response";
import { setSessionCookie } from "@/server/auth/session";
import { parseJsonBody } from "@/server/validation/body";
import { loginBodySchema } from "@/server/modules/auth/auth.schemas";
import { authService } from "@/server/modules/auth/auth.service";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const body = await parseJsonBody(request, loginBodySchema);
    const { token, user } = await authService.login(body);
    const response = jsonOk(user);
    setSessionCookie(response, token);
    return response;
  });
}
