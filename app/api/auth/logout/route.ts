import { handleRoute, jsonOk } from "@/server/http/response";
import { clearSessionCookie } from "@/server/auth/session";

export async function POST() {
  return handleRoute(async () => {
    const response = jsonOk({ success: true });
    clearSessionCookie(response);
    return response;
  });
}
