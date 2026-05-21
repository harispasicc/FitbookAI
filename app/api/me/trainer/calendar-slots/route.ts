import { handleRoute, jsonOk } from "@/server/http/response";
import { parseSearchParams } from "@/server/validation/params";
import { calendarSlotsQuerySchema } from "@/server/modules/trainer-portal/trainer-portal.schemas";
import { trainerPortalService } from "@/server/modules/trainer-portal/trainer-portal.service";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const query = parseSearchParams(request, calendarSlotsQuerySchema);
    const slots = await trainerPortalService.listCalendarSlots(query);
    return jsonOk(slots);
  });
}
