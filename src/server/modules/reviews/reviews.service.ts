import { ApiError } from "@/server/http/api-error";
import { requireClientSession } from "@/server/auth/require-session";
import { toCoachReviewDto } from "@/server/modules/coaches/coaches.dto";
import { bookingsRepository } from "@/server/modules/bookings/bookings.repository";
import { reviewsRepository } from "@/server/modules/reviews/reviews.repository";
import type { createBookingReviewBodySchema } from "@/server/modules/reviews/reviews.schemas";
import type { z } from "zod";

export type CreateBookingReviewInput = z.infer<typeof createBookingReviewBodySchema>;

export const reviewsService = {
  async createForBooking(bookingId: string, input: CreateBookingReviewInput) {
    const session = await requireClientSession();
    const booking = await bookingsRepository.findById(bookingId);

    if (!booking) {
      throw ApiError.notFound("Booking not found");
    }

    if (booking.clientUserId !== session.sub) {
      throw ApiError.forbidden("You can only review your own sessions");
    }

    if (booking.status !== "COMPLETED") {
      throw ApiError.unprocessableEntity(
        "You can review a session after your coach marks it completed",
      );
    }

    const existing = await reviewsRepository.findByBookingId(bookingId);
    if (existing) {
      throw ApiError.conflict("You already reviewed this session");
    }

    const authorName =
      booking.clientUser.clientProfile?.fullName?.trim() ??
      booking.clientUser.email.split("@")[0] ??
      "Client";

    const review = await reviewsRepository.create({
      trainerProfileId: booking.trainerProfileId,
      clientUserId: session.sub,
      bookingId,
      authorName,
      rating: input.rating,
      comment: input.comment?.trim() || null,
    });

    return toCoachReviewDto(review);
  },
};
