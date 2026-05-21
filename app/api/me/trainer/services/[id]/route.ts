import { handleRoute, jsonOk } from "@/server/http/response";
import { parseJsonBody } from "@/server/validation/body";
import { parseRouteParams } from "@/server/validation/params";
import {
  trainerServiceIdParamSchema,
  updateTrainerServiceBodySchema,
} from "@/server/modules/trainer-portal/trainer-portal.schemas";
import { trainerPortalService } from "@/server/modules/trainer-portal/trainer-portal.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const { id } = await parseRouteParams(
      context.params,
      trainerServiceIdParamSchema,
    );
    const body = await parseJsonBody(request, updateTrainerServiceBodySchema);
    const service = await trainerPortalService.updateService(id, body);
    return jsonOk(service);
  });
}
