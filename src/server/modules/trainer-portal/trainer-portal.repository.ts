import { prisma } from "@/lib/prisma";

export const trainerPortalRepository = {
  findProfileByUserId(userId: string) {
    return prisma.trainerProfile.findUnique({
      where: { userId },
      include: { user: { select: { id: true, email: true } } },
    });
  },

  updateProfile(
    trainerProfileId: string,
    data: {
      fullName?: string;
      specialty?: string;
      bio?: string;
      yearsExperience?: number;
    },
  ) {
    return prisma.trainerProfile.update({
      where: { id: trainerProfileId },
      data,
      include: { user: { select: { id: true, email: true } } },
    });
  },

  listServices(trainerProfileId: string) {
    return prisma.trainerService.findMany({
      where: { trainerProfileId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  },

  findServiceById(trainerProfileId: string, serviceId: string) {
    return prisma.trainerService.findFirst({
      where: { id: serviceId, trainerProfileId },
    });
  },

  getNextServiceSortOrder(trainerProfileId: string) {
    return prisma.trainerService
      .aggregate({
        where: { trainerProfileId },
        _max: { sortOrder: true },
      })
      .then((r) => (r._max.sortOrder ?? -1) + 1);
  },

  createService(
    trainerProfileId: string,
    data: {
      title: string;
      description?: string;
      durationMinutes: number;
      priceCents: number;
      isActive?: boolean;
      sortOrder: number;
    },
  ) {
    return prisma.trainerService.create({
      data: {
        trainerProfileId,
        title: data.title,
        description: data.description,
        durationMinutes: data.durationMinutes,
        priceCents: data.priceCents,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder,
      },
    });
  },

  updateService(
    serviceId: string,
    data: {
      title?: string;
      description?: string | null;
      durationMinutes?: number;
      priceCents?: number;
      isActive?: boolean;
      sortOrder?: number;
    },
  ) {
    return prisma.trainerService.update({
      where: { id: serviceId },
      data,
    });
  },

  listServiceSlots(
    trainerProfileId: string,
    serviceId: string,
    from: Date = new Date(),
  ) {
    return prisma.trainerAvailabilitySlot.findMany({
      where: {
        trainerProfileId,
        serviceId,
        startsAt: { gte: from },
      },
      orderBy: { startsAt: "asc" },
      take: 50,
    });
  },

  findSlotById(trainerProfileId: string, serviceId: string, slotId: string) {
    return prisma.trainerAvailabilitySlot.findFirst({
      where: { id: slotId, trainerProfileId, serviceId },
    });
  },

  createServiceSlot(data: {
    trainerProfileId: string;
    serviceId: string;
    startsAt: Date;
    endsAt: Date;
  }) {
    return prisma.trainerAvailabilitySlot.create({
      data: {
        trainerProfileId: data.trainerProfileId,
        serviceId: data.serviceId,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
      },
    });
  },

  deleteServiceSlot(slotId: string) {
    return prisma.trainerAvailabilitySlot.delete({
      where: { id: slotId },
    });
  },

  countDistinctClients(trainerProfileId: string) {
    return prisma.booking
      .findMany({
        where: { trainerProfileId, status: { not: "CANCELLED" } },
        select: { clientUserId: true },
        distinct: ["clientUserId"],
      })
      .then((rows) => rows.length);
  },

  updatePlan(trainerProfileId: string, plan: "FREE" | "PRO" | "AI_PRO") {
    return prisma.trainerProfile.update({
      where: { id: trainerProfileId },
      data: { plan },
      select: { id: true, plan: true },
    });
  },

  findAllBookingsForInsights(trainerProfileId: string) {
    return prisma.booking.findMany({
      where: { trainerProfileId },
      include: {
        service: {
          select: { id: true, title: true, durationMinutes: true, priceCents: true },
        },
        clientUser: {
          select: {
            id: true,
            email: true,
            clientProfile: {
              select: {
                fullName: true,
                headline: true,
                goals: {
                  select: {
                    activeGoal: true,
                    pctLose: true,
                    pctMuscle: true,
                    pctConditioning: true,
                    pctRehab: true,
                  },
                },
              },
            },
          },
        },
        trainerProfile: {
          select: { id: true, fullName: true, specialty: true },
        },
      },
      orderBy: { startsAt: "desc" },
    });
  },

  listWeeklyAvailability(trainerProfileId: string) {
    return prisma.trainerWeeklyAvailability.findMany({
      where: { trainerProfileId },
      orderBy: { dayOfWeek: "asc" },
    });
  },

  replaceWeeklyAvailability(
    trainerProfileId: string,
    days: { dayOfWeek: number; startTime: string; endTime: string }[],
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.trainerWeeklyAvailability.deleteMany({
        where: { trainerProfileId },
      });
      if (days.length > 0) {
        await tx.trainerWeeklyAvailability.createMany({
          data: days.map((d) => ({
            trainerProfileId,
            dayOfWeek: d.dayOfWeek,
            startTime: d.startTime,
            endTime: d.endTime,
          })),
        });
      }
    });
  },

  findClientBookings(trainerProfileId: string, clientUserId: string) {
    return prisma.booking.findMany({
      where: { trainerProfileId, clientUserId },
      include: {
        service: {
          select: { id: true, title: true, durationMinutes: true, priceCents: true },
        },
        clientUser: {
          select: {
            id: true,
            email: true,
            clientProfile: {
              select: {
                fullName: true,
                headline: true,
                goals: {
                  select: {
                    activeGoal: true,
                    pctLose: true,
                    pctMuscle: true,
                    pctConditioning: true,
                    pctRehab: true,
                  },
                },
              },
            },
          },
        },
        trainerProfile: {
          select: { id: true, fullName: true, specialty: true },
        },
      },
      orderBy: { startsAt: "desc" },
    });
  },

  findClientNotesMap(trainerProfileId: string) {
    return prisma.trainerClientNote.findMany({
      where: { trainerProfileId },
      select: { clientUserId: true, notes: true },
    });
  },

  upsertClientNote(
    trainerProfileId: string,
    clientUserId: string,
    notes: string,
  ) {
    return prisma.trainerClientNote.upsert({
      where: {
        trainerProfileId_clientUserId: {
          trainerProfileId,
          clientUserId,
        },
      },
      create: { trainerProfileId, clientUserId, notes },
      update: { notes },
    });
  },

  updateNotificationPrefs(
    trainerProfileId: string,
    prefs: import("@prisma/client").Prisma.InputJsonValue,
  ) {
    return prisma.trainerProfile.update({
      where: { id: trainerProfileId },
      data: { notificationPrefs: prefs },
      select: { notificationPrefs: true },
    });
  },

  findNotificationReadIds(trainerUserId: string) {
    return prisma.trainerNotificationRead.findMany({
      where: { trainerUserId },
      select: { notificationId: true },
    });
  },

  markNotificationRead(trainerUserId: string, notificationId: string) {
    return prisma.trainerNotificationRead.upsert({
      where: {
        trainerUserId_notificationId: {
          trainerUserId,
          notificationId,
        },
      },
      create: { trainerUserId, notificationId },
      update: { readAt: new Date() },
    });
  },

  markAllNotificationsRead(trainerUserId: string, notificationIds: string[]) {
    if (notificationIds.length === 0) return Promise.resolve();
    return prisma.$transaction(
      notificationIds.map((notificationId) =>
        prisma.trainerNotificationRead.upsert({
          where: {
            trainerUserId_notificationId: {
              trainerUserId,
              notificationId,
            },
          },
          create: { trainerUserId, notificationId },
          update: { readAt: new Date() },
        }),
      ),
    );
  },

  listOpenSlotsInRange(
    trainerProfileId: string,
    from: Date,
    to: Date,
  ) {
    return prisma.trainerAvailabilitySlot.findMany({
      where: {
        trainerProfileId,
        isBooked: false,
        startsAt: { gte: from, lte: to },
        OR: [{ booking: null }, { booking: { status: "CANCELLED" } }],
      },
      orderBy: { startsAt: "asc" },
      select: {
        id: true,
        startsAt: true,
        endsAt: true,
        serviceId: true,
      },
    });
  },
};
