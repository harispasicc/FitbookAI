import { handleRoute, jsonOk } from "@/server/http/response";
import { parseJsonBody } from "@/server/validation/body";
import { updateTrainerProfileBodySchema } from "@/server/modules/trainer-portal/trainer-portal.schemas";
import { trainerPortalService } from "@/server/modules/trainer-portal/trainer-portal.service";

export async function GET() {
  return handleRoute(async () => {
    const profile = await trainerPortalService.getProfile();
    return jsonOk(profile);
  });
}

export async function PATCH(request: Request) {
  return handleRoute(async () => {
    const body = await parseJsonBody(request, updateTrainerProfileBodySchema);
    const profile = await trainerPortalService.updateProfile(body);
    return jsonOk(profile);
  });
}
