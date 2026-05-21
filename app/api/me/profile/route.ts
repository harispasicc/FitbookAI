import { handleRoute, jsonOk } from "@/server/http/response";
import { parseJsonBody } from "@/server/validation/body";
import { updateProfileBodySchema } from "@/server/modules/client-portal/client-portal.schemas";
import { clientPortalService } from "@/server/modules/client-portal/client-portal.service";

export async function GET() {
  return handleRoute(async () => {
    const profile = await clientPortalService.getProfile();
    return jsonOk(profile);
  });
}

export async function PATCH(request: Request) {
  return handleRoute(async () => {
    const body = await parseJsonBody(request, updateProfileBodySchema);
    const profile = await clientPortalService.updateProfile(body);
    return jsonOk(profile);
  });
}
