import { handleRoute, jsonOk } from "@/server/http/response";
import { parseSearchParams } from "@/server/validation/params";
import { listBookingsQuerySchema } from "@/server/modules/bookings/bookings.schemas";
import { bookingsService } from "@/server/modules/bookings/bookings.service";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const query = parseSearchParams(request, listBookingsQuerySchema);
    const { items, meta } = await bookingsService.listMyBookings(query);
    return jsonOk(items, { meta });
  });
}
