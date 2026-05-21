import { handleRoute, jsonOk } from "@/server/http/response";
import { parseSearchParams } from "@/server/validation/params";
import { trainerSearchQuerySchema } from "@/server/modules/trainer-portal/trainer-portal.schemas";
import { trainerPortalService } from "@/server/modules/trainer-portal/trainer-portal.service";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const query = parseSearchParams(request, trainerSearchQuerySchema);
    const results = await trainerPortalService.search(query);
    return jsonOk(results);
  });
}
