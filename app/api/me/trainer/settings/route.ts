import { handleRoute, jsonOk } from "@/server/http/response";
import { parseJsonBody } from "@/server/validation/body";
import { trainerNotificationPrefsBodySchema } from "@/server/modules/trainer-portal/trainer-portal.schemas";
import { trainerPortalService } from "@/server/modules/trainer-portal/trainer-portal.service";

export async function GET() {
  return handleRoute(async () => {
    const data = await trainerPortalService.getSettings();
    return jsonOk(data);
  });
}

export async function PATCH(request: Request) {
  return handleRoute(async () => {
    const body = await parseJsonBody(request, trainerNotificationPrefsBodySchema);
    const data = await trainerPortalService.updateSettings(body);
    return jsonOk(data);
  });
}
