import { handleRoute, jsonOk } from "@/server/http/response";
import { parseRouteParams } from "@/server/validation/params";
import { serviceSlotIdParamSchema } from "@/server/modules/trainer-portal/trainer-portal.schemas";
import { trainerPortalService } from "@/server/modules/trainer-portal/trainer-portal.service";

type RouteContext = {
  params: Promise<{ id: string; slotId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const { id, slotId } = await parseRouteParams(
      context.params,
      serviceSlotIdParamSchema,
    );
    const result = await trainerPortalService.deleteServiceSlot(id, slotId);
    return jsonOk(result);
  });
}
