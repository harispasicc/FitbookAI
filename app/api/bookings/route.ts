import { handleRoute, jsonOk } from "@/server/http/response";
import { parseJsonBody } from "@/server/validation/body";
import { createBookingBodySchema } from "@/server/modules/bookings/bookings.schemas";
import { bookingsService } from "@/server/modules/bookings/bookings.service";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const body = await parseJsonBody(request, createBookingBodySchema);
    const booking = await bookingsService.createBooking(body);
    return jsonOk(booking, { status: 201 });
  });
}
