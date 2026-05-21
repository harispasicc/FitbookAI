import type { BookingDto } from "@/lib/bookings-api";
import type { BookingRow } from "@/lib/mock-bookings";

export function bookingDtoToRow(
  booking: BookingDto,
  perspective: "client" | "trainer",
): BookingRow {
  const startsAt = new Date(booking.startsAt);

  return {
    id: booking.id,
    guest:
      perspective === "client"
        ? (booking.trainer.fullName ?? "Coach")
        : booking.client.name,
    service: booking.service.title,
    date: startsAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: booking.status,
    amount: booking.priceLabel,
    slotIso: booking.startsAt,
    trainerId: booking.trainer.id,
    serviceId: booking.service.id,
    clientEmail: booking.client.email,
    hasReview: booking.hasReview,
  };
}
