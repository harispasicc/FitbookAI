import { handleRoute, jsonOk } from "@/server/http/response";
import { clientPortalService } from "@/server/modules/client-portal/client-portal.service";

export async function GET() {
  return handleRoute(async () => {
    const notifications = await clientPortalService.listNotifications();
    return jsonOk(notifications);
  });
}
