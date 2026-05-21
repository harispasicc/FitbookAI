import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@prisma/client";
import type { z } from "zod";
import type { listBookingsQuerySchema } from "@/server/modules/bookings/bookings.schemas";

export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;

const bookingInclude = {
  service: {
    select: { id: true, title: true, durationMinutes: true, priceCents: true },
  },
  clientUser: {
    select: {
      id: true,
      email: true,
      clientProfile: { select: { fullName: true } },
    },
  },
  trainerProfile: {
    select: { id: true, fullName: true, specialty: true },
  },
  review: {
    select: { id: true },
  },
} as const;

function buildListWhere(
  base: { clientUserId?: string; trainerProfileId?: string },
  query: ListBookingsQuery,
) {
  return {
    ...base,
    ...(query.status ? { status: query.status.toUpperCase() as BookingStatus } : {}),
    ...(query.from || query.to
      ? {
          startsAt: {
            ...(query.from ? { gte: query.from } : {}),
            ...(query.to ? { lte: query.to } : {}),
          },
        }
      : {}),
  };
}

export const bookingsRepository = {
  findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: bookingInclude,
    });
  },

  findManyForClient(clientUserId: string, query: ListBookingsQuery) {
    const where = buildListWhere({ clientUserId }, query);
    return Promise.all([
      prisma.booking.findMany({
        where,
        include: bookingInclude,
        orderBy: { startsAt: "asc" },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.booking.count({ where }),
    ]);
  },

  findManyForTrainer(trainerProfileId: string, query: ListBookingsQuery) {
    const where = buildListWhere({ trainerProfileId }, query);
    return Promise.all([
      prisma.booking.findMany({
        where,
        include: bookingInclude,
        orderBy: { startsAt: "asc" },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.booking.count({ where }),
    ]);
  },

  createWithSlot(input: {
    clientUserId: string;
    trainerProfileId: string;
    serviceId: string;
    availabilitySlotId: string;
    startsAt: Date;
    endsAt: Date;
    priceCents: number;
    notes?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const existingOnSlot = await tx.booking.findFirst({
        where: { availabilitySlotId: input.availabilitySlotId },
        select: { id: true, status: true },
      });

      if (existingOnSlot) {
        if (existingOnSlot.status !== "CANCELLED") {
          return null;
        }
        await tx.booking.update({
          where: { id: existingOnSlot.id },
          data: { availabilitySlotId: null },
        });
      }

      const slot = await tx.trainerAvailabilitySlot.updateMany({
        where: {
          id: input.availabilitySlotId,
          trainerProfileId: input.trainerProfileId,
          isBooked: false,
        },
        data: { isBooked: true },
      });

      if (slot.count === 0) {
        return null;
      }

      try {
        return await tx.booking.create({
          data: {
            clientUserId: input.clientUserId,
            trainerProfileId: input.trainerProfileId,
            serviceId: input.serviceId,
            availabilitySlotId: input.availabilitySlotId,
            startsAt: input.startsAt,
            endsAt: input.endsAt,
            priceCents: input.priceCents,
            notes: input.notes,
            status: "PENDING",
          },
          include: bookingInclude,
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          return null;
        }
        throw error;
      }
    });
  },

  updateStatus(id: string, status: BookingStatus) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.booking.findUnique({
        where: { id },
        select: { status: true, availabilitySlotId: true },
      });

      if (!existing) {
        return null;
      }

      const booking = await tx.booking.update({
        where: { id },
        data: {
          status,
          ...(status === "CANCELLED" ? { availabilitySlotId: null } : {}),
        },
        include: bookingInclude,
      });

      if (
        status === "CANCELLED" &&
        existing.availabilitySlotId &&
        existing.status !== "CANCELLED"
      ) {
        await tx.trainerAvailabilitySlot.update({
          where: { id: existing.availabilitySlotId },
          data: { isBooked: false },
        });
      }

      return booking;
    });
  },

  cancelAndReleaseSlot(id: string) {
    return this.updateStatus(id, "CANCELLED");
  },

  rescheduleToSlot(bookingId: string, newSlotId: string) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { service: true },
      });

      if (!booking) return null;

      if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
        return null;
      }

      const newSlot = await tx.trainerAvailabilitySlot.findFirst({
        where: {
          id: newSlotId,
          trainerProfileId: booking.trainerProfileId,
          isBooked: false,
        },
      });

      if (!newSlot) return null;

      if (
        newSlot.serviceId &&
        newSlot.serviceId !== booking.serviceId
      ) {
        return null;
      }

      const oldSlotId = booking.availabilitySlotId;

      if (oldSlotId) {
        await tx.trainerAvailabilitySlot.update({
          where: { id: oldSlotId },
          data: { isBooked: false },
        });
      }

      const booked = await tx.trainerAvailabilitySlot.updateMany({
        where: {
          id: newSlotId,
          trainerProfileId: booking.trainerProfileId,
          isBooked: false,
        },
        data: { isBooked: true },
      });

      if (booked.count === 0) {
        if (oldSlotId) {
          await tx.trainerAvailabilitySlot.update({
            where: { id: oldSlotId },
            data: { isBooked: true },
          });
        }
        return null;
      }

      return tx.booking.update({
        where: { id: bookingId },
        data: {
          availabilitySlotId: newSlotId,
          startsAt: newSlot.startsAt,
          endsAt: newSlot.endsAt,
        },
        include: bookingInclude,
      });
    });
  },
};
