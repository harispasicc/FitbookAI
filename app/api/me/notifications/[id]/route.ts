import { handleRoute, jsonOk } from "@/server/http/response";
import { parseJsonBody } from "@/server/validation/body";
import { parseRouteParams } from "@/server/validation/params";
import {
  notificationIdParamSchema,
  patchNotificationBodySchema,
} from "@/server/modules/client-portal/client-portal.schemas";
import { clientPortalService } from "@/server/modules/client-portal/client-portal.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const { id } = await parseRouteParams(context.params, notificationIdParamSchema);
    await parseJsonBody(request, patchNotificationBodySchema);
    const notification = await clientPortalService.markNotificationRead(id);
    return jsonOk(notification);
  });
}
