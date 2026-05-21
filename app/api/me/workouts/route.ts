import { handleRoute, jsonOk } from "@/server/http/response";
import { parseSearchParams } from "@/server/validation/params";
import { listWorkoutsQuerySchema } from "@/server/modules/client-portal/client-portal.schemas";
import { clientPortalService } from "@/server/modules/client-portal/client-portal.service";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const query = parseSearchParams(request, listWorkoutsQuerySchema);
    const { items, meta } = await clientPortalService.listWorkouts(query);
    return jsonOk(items, { meta });
  });
}
