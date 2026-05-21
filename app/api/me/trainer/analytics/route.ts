import { handleRoute, jsonOk } from "@/server/http/response";
import { trainerPortalService } from "@/server/modules/trainer-portal/trainer-portal.service";

export async function GET() {
  return handleRoute(async () => {
    const analytics = await trainerPortalService.getAnalytics();
    return jsonOk(analytics);
  });
}
