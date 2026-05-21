import { handleRoute, jsonOk } from "@/server/http/response";
import { parseJsonBody } from "@/server/validation/body";
import { parseRouteParams } from "@/server/validation/params";
import {
  createServiceSlotBodySchema,
  trainerServiceIdParamSchema,
} from "@/server/modules/trainer-portal/trainer-portal.schemas";
import { trainerPortalService } from "@/server/modules/trainer-portal/trainer-portal.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const { id } = await parseRouteParams(context.params, trainerServiceIdParamSchema);
    const slots = await trainerPortalService.listServiceSlots(id);
    return jsonOk(slots);
  });
}

export async function POST(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const { id } = await parseRouteParams(context.params, trainerServiceIdParamSchema);
    const body = await parseJsonBody(request, createServiceSlotBodySchema);
    const slot = await trainerPortalService.createServiceSlot(id, body);
    return jsonOk(slot);
  });
}
