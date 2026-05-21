import { handleRoute, jsonOk } from "@/server/http/response";
import { parseJsonBody } from "@/server/validation/body";
import { updateGoalsBodySchema } from "@/server/modules/client-portal/client-portal.schemas";
import { clientPortalService } from "@/server/modules/client-portal/client-portal.service";

export async function GET() {
  return handleRoute(async () => {
    const goals = await clientPortalService.getGoals();
    return jsonOk(goals);
  });
}

export async function PATCH(request: Request) {
  return handleRoute(async () => {
    const body = await parseJsonBody(request, updateGoalsBodySchema);
    const goals = await clientPortalService.updateGoals(body);
    return jsonOk(goals);
  });
}
