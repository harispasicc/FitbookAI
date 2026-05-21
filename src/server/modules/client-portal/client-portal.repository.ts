import type { ClientGoals } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ClientGoalKey } from "@prisma/client";
import {
  readGoalCustomNotes,
  writeGoalCustomNotes,
} from "@/server/modules/client-portal/goal-notes-db";
import type { z } from "zod";
import type { listWorkoutsQuerySchema } from "@/server/modules/client-portal/client-portal.schemas";

export type ListWorkoutsQuery = z.infer<typeof listWorkoutsQuerySchema>;

const profileInclude = {
  user: { select: { id: true, email: true } },
} as const;

export const clientPortalRepository = {
  findProfileByUserId(userId: string) {
    return prisma.clientProfile.findUnique({
      where: { userId },
      include: profileInclude,
    });
  },

  updateProfile(
    clientProfileId: string,
    data: {
      fullName?: string;
      headline?: string;
      phone?: string;
      city?: string;
      timezone?: string;
      bio?: string;
      selectedTrainerProfileId?: string | null;
    },
  ) {
    return prisma.clientProfile.update({
      where: { id: clientProfileId },
      data,
      include: profileInclude,
    });
  },

  findSelectedCoach(trainerProfileId: string) {
    return prisma.trainerProfile.findUnique({
      where: { id: trainerProfileId },
      include: {
        user: { select: { email: true } },
        services: { select: { id: true, title: true, isActive: true } },
        reviews: { select: { rating: true } },
      },
    });
  },

  async findOrCreateGoals(clientProfileId: string) {
    let row = await prisma.clientGoals.findUnique({
      where: { clientProfileId },
    });

    if (!row) {
      try {
        row = await prisma.clientGoals.create({
          data: { clientProfileId },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          row = await prisma.clientGoals.findUniqueOrThrow({
            where: { clientProfileId },
          });
        } else {
          throw error;
        }
      }
    }

    const customNotes = await readGoalCustomNotes(clientProfileId);
    return { ...row, customNotes } as ClientGoals;
  },

  async updateGoals(
    clientProfileId: string,
    data: {
      activeGoal?: ClientGoalKey;
      pctLose?: number;
      pctMuscle?: number;
      pctConditioning?: number;
      pctRehab?: number;
      customNotes?: Prisma.InputJsonValue;
    },
  ) {
    const { customNotes, ...rest } = data;

    const updated = await prisma.clientGoals.update({
      where: { clientProfileId },
      data: rest,
    });

    if (customNotes !== undefined) {
      await writeGoalCustomNotes(clientProfileId, customNotes);
    }

    const notes = await readGoalCustomNotes(clientProfileId);
    return { ...updated, customNotes: notes } as ClientGoals;
  },

  findWorkouts(clientProfileId: string, query: ListWorkoutsQuery) {
    const where = {
      clientProfileId,
      ...(query.type
        ? { type: { contains: query.type, mode: "insensitive" as const } }
        : {}),
    };

    return Promise.all([
      prisma.clientWorkout.findMany({
        where,
        orderBy: { workoutDate: "desc" },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.clientWorkout.count({ where }),
    ]);
  },

  findNotifications(clientProfileId: string) {
    return prisma.clientNotification.findMany({
      where: { clientProfileId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  },

  findNotificationForClient(clientProfileId: string, notificationId: string) {
    return prisma.clientNotification.findFirst({
      where: { id: notificationId, clientProfileId },
    });
  },

  markNotificationRead(notificationId: string) {
    return prisma.clientNotification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  },
};
