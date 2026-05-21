import { handleRoute, jsonOk } from "@/server/http/response";
import { coachesService } from "@/server/modules/coaches/coaches.service";

export async function GET() {
  return handleRoute(async () => {
    const items = await coachesService.listFeaturedTestimonials(6);
    return jsonOk(items);
  });
}
