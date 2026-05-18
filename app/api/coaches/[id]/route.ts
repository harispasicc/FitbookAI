import { handleRoute, jsonOk } from "@/server/http/response";
import { coachIdParamSchema, parseRouteParams } from "@/server/validation/params";
import { coachesService } from "@/server/modules/coaches/coaches.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const { id } = await parseRouteParams(context.params, coachIdParamSchema);
    const coach = await coachesService.getCoachById(id);
    return jsonOk(coach);
  });
}
