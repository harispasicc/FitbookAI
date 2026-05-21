import { handleRoute, jsonOk } from "@/server/http/response";
import { parseJsonBody } from "@/server/validation/body";
import { updateWeeklyAvailabilityBodySchema } from "@/server/modules/trainer-portal/trainer-portal.schemas";
import { trainerPortalService } from "@/server/modules/trainer-portal/trainer-portal.service";

export async function GET() {
  return handleRoute(async () => {
    const schedule = await trainerPortalService.getWeeklyAvailability();
    return jsonOk(schedule);
  });
}

export async function PATCH(request: Request) {
  return handleRoute(async () => {
    const body = await parseJsonBody(request, updateWeeklyAvailabilityBodySchema);
    const schedule = await trainerPortalService.updateWeeklyAvailability(body);
    return jsonOk(schedule);
  });
}
