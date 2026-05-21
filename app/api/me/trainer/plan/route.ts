import { handleRoute, jsonOk } from "@/server/http/response";
import { parseJsonBody } from "@/server/validation/body";
import { updateTrainerPlanBodySchema } from "@/server/modules/trainer-portal/trainer-portal.schemas";
import { trainerPortalService } from "@/server/modules/trainer-portal/trainer-portal.service";

export async function GET() {
  return handleRoute(async () => {
    const plan = await trainerPortalService.getPlan();
    return jsonOk(plan);
  });
}

export async function PATCH(request: Request) {
  return handleRoute(async () => {
    const body = await parseJsonBody(request, updateTrainerPlanBodySchema);
    const plan = await trainerPortalService.updatePlan(body);
    return jsonOk(plan);
  });
}
