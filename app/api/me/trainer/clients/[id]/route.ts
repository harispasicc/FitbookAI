import { handleRoute, jsonOk } from "@/server/http/response";
import { parseJsonBody } from "@/server/validation/body";
import { parseRouteParams } from "@/server/validation/params";
import {
  trainerClientIdParamSchema,
  updateTrainerClientNotesBodySchema,
} from "@/server/modules/trainer-portal/trainer-portal.schemas";
import { trainerPortalService } from "@/server/modules/trainer-portal/trainer-portal.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const { id } = await parseRouteParams(
      context.params,
      trainerClientIdParamSchema,
    );
    const detail = await trainerPortalService.getClient(id);
    return jsonOk(detail);
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const { id } = await parseRouteParams(
      context.params,
      trainerClientIdParamSchema,
    );
    const body = await parseJsonBody(request, updateTrainerClientNotesBodySchema);
    const detail = await trainerPortalService.updateClientNotes(id, body);
    return jsonOk(detail);
  });
}
