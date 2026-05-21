import { handleRoute, jsonOk } from "@/server/http/response";
import { parseJsonBody } from "@/server/validation/body";
import { forgotPasswordBodySchema } from "@/server/modules/auth/auth.schemas";
import { authService } from "@/server/modules/auth/auth.service";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const body = await parseJsonBody(request, forgotPasswordBodySchema);
    const result = await authService.forgotPassword(body);
    const { devResetUrl, ...data } = result;
    return jsonOk(data, devResetUrl ? { meta: { devResetUrl } } : undefined);
  });
}
