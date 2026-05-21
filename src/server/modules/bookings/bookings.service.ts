import type { BookingStatus } from "@prisma/client";
import { ApiError } from "@/server/http/api-error";
import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/server/auth/session";
import {
  getTrainerProfileIdForUser,
  requireClientSession,
  requireSession,
  requireTrainerSession,
} from "@/server/auth/require-session";
import {
  apiStatusToPrisma,
  prismaStatusToApi,
  toBookingDto,
} from "@/server/modules/bookings/bookings.dto";
import { bookingsRepository } from "@/server/modules/bookings/bookings.repository";
import {
  notifyBookingCreated,
  notifyBookingStatusChange,
} from "@/server/email/booking-emails";
import type {
  createBookingBodySchema,
  listBookingsQuerySchema,
  updateBookingBodySchema,
} from "@/server/modules/bookings/bookings.schemas";
import type { z } from "zod";

export type CreateBookingInput = z.infer<typeof createBookingBodySchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingBodySchema>;
export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;

const ALLOWED_TRANSITIONS: Record<
  BookingStatus,
  Partial<Record<BookingStatus, ("client" | "trainer")[]>>
> = {
  PENDING: {
    CONFIRMED: ["trainer"],
    CANCELLED: ["client", "trainer"],
  },
  CONFIRMED: {
    COMPLETED: ["trainer"],
    CANCELLED: ["trainer", "client"],
  },
  CANCELLED: {},
  COMPLETED: {},
};

async function requireBooking(id: string) {
  const booking = await bookingsRepository.findById(id);
  if (!booking) {
    throw ApiError.notFound("Booking not found");
  }
  return booking;
}

function assertTransition(
  from: BookingStatus,
  to: BookingStatus,
  actorRole: "client" | "trainer",
) {
  const allowed = ALLOWED_TRANSITIONS[from][to];
  if (!allowed?.includes(actorRole)) {
    throw ApiError.validation(
      `Cannot change booking status from ${from.toLowerCase()} to ${to.toLowerCase()} as ${actorRole}`,
    );
  }
}

async function assertCanAccessBooking(
  booking: { clientUserId: string; trainerProfileId: string },
  session: SessionPayload,
) {
  if (session.role === "client") {
    if (booking.clientUserId !== session.sub) {
      throw ApiError.forbidden("You do not have access to this booking");
    }
    return;
  }

  const trainerProfileId = await getTrainerProfileIdForUser(session.sub);
  if (booking.trainerProfileId !== trainerProfileId) {
    throw ApiError.forbidden("You do not have access to this booking");
  }
}

export const bookingsService = {
  async createBooking(input: CreateBookingInput) {
    const session = await requireClientSession();

    const service = await prisma.trainerService.findFirst({
      where: {
        id: input.serviceId,
        trainerProfileId: input.trainerProfileId,
        isActive: true,
      },
    });

    if (!service) {
      throw ApiError.notFound("Service not found for this coach");
    }

    const slot = await prisma.trainerAvailabilitySlot.findFirst({
      where: {
        id: input.availabilitySlotId,
        trainerProfileId: input.trainerProfileId,
      },
    });

    if (!slot) {
      throw ApiError.notFound("Availability slot not found for this coach");
    }

    if (slot.serviceId && slot.serviceId !== service.id) {
      throw ApiError.conflict("This time slot is not available for the selected service");
    }

    if (slot.isBooked) {
      throw ApiError.conflict("This time slot is no longer available");
    }

    const booking = await bookingsRepository.createWithSlot({
      clientUserId: session.sub,
      trainerProfileId: input.trainerProfileId,
      serviceId: service.id,
      availabilitySlotId: slot.id,
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      priceCents: service.priceCents,
      notes: input.notes?.trim() || undefined,
    });

    if (!booking) {
      throw ApiError.conflict("This time slot was just booked by someone else");
    }

    const dto = toBookingDto(booking);
    void notifyBookingCreated(dto).catch((err) =>
      console.error("[fitbook] booking email failed", err),
    );
    return dto;
  },

  async listMyBookings(query: ListBookingsQuery) {
    const session = await requireClientSession();
    const [bookings, total] = await bookingsRepository.findManyForClient(
      session.sub,
      query,
    );

    return {
      items: bookings.map(toBookingDto),
      meta: { total, limit: query.limit, offset: query.offset },
    };
  },

  async listTrainerBookings(query: ListBookingsQuery) {
    const session = await requireTrainerSession();
    const trainerProfileId = await getTrainerProfileIdForUser(session.sub);
    const [bookings, total] = await bookingsRepository.findManyForTrainer(
      trainerProfileId,
      query,
    );

    return {
      items: bookings.map(toBookingDto),
      meta: { total, limit: query.limit, offset: query.offset },
    };
  },

  async updateBooking(bookingId: string, input: UpdateBookingInput) {
    const session = await requireSession();
    const booking = await requireBooking(bookingId);
    await assertCanAccessBooking(booking, session);

    if (input.availabilitySlotId) {
      if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
        throw ApiError.validation("Cannot reschedule a cancelled or completed booking");
      }
      const updated = await bookingsRepository.rescheduleToSlot(
        bookingId,
        input.availabilitySlotId,
      );
      if (!updated) {
        throw ApiError.conflict("That time slot is no longer available");
      }
      const dto = toBookingDto(updated);
      const clientTo = booking.clientUser.email;
      void import("@/server/email/send-email").then(({ sendEmail }) =>
        sendEmail({
          to: clientTo,
          subject: "Session rescheduled",
          html: `<p>Your session was moved to ${new Date(dto.startsAt).toLocaleString("en-GB")}.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/me/sessions">View sessions</a></p>`,
        }),
      ).catch((err) => console.error("[fitbook] reschedule email failed", err));
      return dto;
    }

    const previousStatus = prismaStatusToApi(booking.status);
    const nextStatus = apiStatusToPrisma(input.status!);
    assertTransition(booking.status, nextStatus, session.role);

    const updated = await bookingsRepository.updateStatus(bookingId, nextStatus);
    if (!updated) {
      throw ApiError.notFound("Booking not found");
    }

    const dto = toBookingDto(updated);
    void notifyBookingStatusChange(dto, previousStatus).catch((err) =>
      console.error("[fitbook] booking email failed", err),
    );
    return dto;
  },

  async deleteBooking(bookingId: string) {
    const session = await requireSession();
    const booking = await requireBooking(bookingId);
    await assertCanAccessBooking(booking, session);

    if (booking.status === "COMPLETED") {
      throw ApiError.validation("Completed bookings cannot be cancelled");
    }

    if (booking.status === "CANCELLED") {
      return toBookingDto(booking);
    }

    const updated = await bookingsRepository.cancelAndReleaseSlot(bookingId);
    if (!updated) {
      throw ApiError.notFound("Booking not found");
    }

    return toBookingDto(updated);
  },
};
