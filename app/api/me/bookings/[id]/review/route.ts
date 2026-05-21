import { handleRoute, jsonOk } from "@/server/http/response";
import { parseJsonBody } from "@/server/validation/body";
import { parseRouteParams } from "@/server/validation/params";
import {
  bookingIdParamSchema,
  createBookingReviewBodySchema,
} from "@/server/modules/reviews/reviews.schemas";
import { reviewsService } from "@/server/modules/reviews/reviews.service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleRoute(async () => {
    const { id } = await parseRouteParams(context.params, bookingIdParamSchema);
    const body = await parseJsonBody(request, createBookingReviewBodySchema);
    const review = await reviewsService.createForBooking(id, body);
    return jsonOk(review);
  });
}
