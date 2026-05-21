import { handleRoute, jsonOk } from "@/server/http/response";
import { parseJsonBody } from "@/server/validation/body";
import { parseRouteParams } from "@/server/validation/params";
import {
  bookingIdParamSchema,
  updateBookingBodySchema,
} from "@/server/modules/bookings/bookings.schemas";
import { bookingsService } from "@/server/modules/bookings/bookings.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const { id } = await parseRouteParams(context.params, bookingIdParamSchema);
    const body = await parseJsonBody(request, updateBookingBodySchema);
    const booking = await bookingsService.updateBooking(id, body);
    return jsonOk(booking);
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return handleRoute(async () => {
    const { id } = await parseRouteParams(context.params, bookingIdParamSchema);
    const booking = await bookingsService.deleteBooking(id);
    return jsonOk(booking);
  });
}
