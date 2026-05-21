import type { Booking, BookingStatus, TrainerService, User } from "@prisma/client";
type BookingWithRelations = Booking & {
  service: Pick<TrainerService, "id" | "title" | "durationMinutes" | "priceCents">;
  clientUser: Pick<User, "id" | "email"> & {
    clientProfile: { fullName: string | null } | null;
  };
  trainerProfile: {
    id: string;
    fullName: string | null;
    specialty: string | null;
  };
  review?: { id: string } | null;
};

function formatPriceCents(cents: number): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export function prismaStatusToApi(status: BookingStatus): AppBookingStatus {
  return status.toLowerCase() as AppBookingStatus;
}

export type AppBookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export function apiStatusToPrisma(status: AppBookingStatus): BookingStatus {
  return status.toUpperCase() as BookingStatus;
}

export function toBookingDto(booking: BookingWithRelations) {
  const clientName =
    booking.clientUser.clientProfile?.fullName ??
    booking.clientUser.email.split("@")[0] ??
    "Client";

  return {
    id: booking.id,
    status: prismaStatusToApi(booking.status),
    startsAt: booking.startsAt.toISOString(),
    endsAt: booking.endsAt.toISOString(),
    priceCents: booking.priceCents,
    priceLabel: formatPriceCents(booking.priceCents),
    notes: booking.notes,
    availabilitySlotId: booking.availabilitySlotId,
    trainer: {
      id: booking.trainerProfile.id,
      fullName: booking.trainerProfile.fullName,
      specialty: booking.trainerProfile.specialty,
    },
    service: {
      id: booking.service.id,
      title: booking.service.title,
      durationMinutes: booking.service.durationMinutes,
    },
    client: {
      id: booking.clientUser.id,
      email: booking.clientUser.email,
      name: clientName,
    },
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    hasReview: Boolean(booking.review),
  };
}

export type BookingDto = ReturnType<typeof toBookingDto>;
