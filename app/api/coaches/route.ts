import { handleRoute, jsonOk } from "@/server/http/response";
import { parseSearchParams } from "@/server/validation/params";
import { listCoachesQuerySchema } from "@/server/modules/coaches/coaches.schemas";
import { coachesService } from "@/server/modules/coaches/coaches.service";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const query = parseSearchParams(request, listCoachesQuerySchema);
    const { items, meta } = await coachesService.listCoaches(query);
    return jsonOk(items, { meta });
  });
}
