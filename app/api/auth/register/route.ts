import { handleRoute, jsonOk } from "@/server/http/response";
import { setSessionCookie } from "@/server/auth/session";
import { parseJsonBody } from "@/server/validation/body";
import { registerBodySchema } from "@/server/modules/auth/auth.schemas";
import { authService } from "@/server/modules/auth/auth.service";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const body = await parseJsonBody(request, registerBodySchema);
    const { token, user } = await authService.register(body);
    const response = jsonOk(user, { status: 201 });
    setSessionCookie(response, token);
    return response;
  });
}
