import { handleRoute, jsonOk } from "@/server/http/response";
import {
  coachIdParamSchema,
  parseRouteParams,
  parseSearchParams,
} from "@/server/validation/params";
import { listAvailabilityQuerySchema } from "@/server/modules/coaches/coaches.schemas";
import { coachesService } from "@/server/modules/coaches/coaches.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const { id } = await parseRouteParams(context.params, coachIdParamSchema);
    const query = parseSearchParams(request, listAvailabilityQuerySchema);
    const availability = await coachesService.getCoachAvailability(id, query);
    return jsonOk(availability);
  });
}
