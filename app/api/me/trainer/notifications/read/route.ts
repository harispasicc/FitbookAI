import { handleRoute, jsonOk } from "@/server/http/response";
import { parseJsonBody } from "@/server/validation/body";
import { markTrainerNotificationsBodySchema } from "@/server/modules/trainer-portal/trainer-portal.schemas";
import { trainerPortalService } from "@/server/modules/trainer-portal/trainer-portal.service";

export async function PATCH(request: Request) {
  return handleRoute(async () => {
    const body = await parseJsonBody(request, markTrainerNotificationsBodySchema);
    const data = await trainerPortalService.markNotificationsRead(body);
    return jsonOk(data);
  });
}
