import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { buildClientKnowledgeBase } from "@/server/modules/ai/client-knowledge";

export const CLIENT_AI_TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "get_account_snapshot",
      description:
        "Full account overview: profile, goals, booking/workout stats, notifications summary, selected coach, coach catalog.",
      parameters: { type: "object", properties: {}, additionalProperties: false },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_my_bookings",
      description: "List the client's bookings with optional status filter.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["pending", "confirmed", "cancelled", "completed", "all"],
            description: "Filter by status; default all",
          },
          limit: { type: "number", description: "Max rows, default 25" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_my_workouts",
      description: "List logged workouts for the client.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Max rows, default 25" },
          type: { type: "string", description: "Optional workout type filter" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_coaches",
      description:
        "Search the coach catalog (all trainers on the platform). Use for recommendations and comparisons.",
      parameters: {
        type: "object",
        properties: {
          specialtyContains: {
            type: "string",
            description: "Filter specialty text (case-insensitive)",
          },
          limit: { type: "number", description: "Max coaches, default 15" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_coach_details",
      description:
        "Detailed coach profile: services, reviews, weekly hours, open booking slots.",
      parameters: {
        type: "object",
        properties: {
          coachId: { type: "string", description: "Trainer profile id" },
        },
        required: ["coachId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_my_notifications",
      description: "In-app notifications for the client.",
      parameters: {
        type: "object",
        properties: {
          unreadOnly: { type: "boolean" },
          limit: { type: "number" },
        },
        additionalProperties: false,
      },
    },
  },
];

const listBookingsArgs = z.object({
  status: z
    .enum(["pending", "confirmed", "cancelled", "completed", "all"])
    .optional(),
  limit: z.number().int().min(1).max(80).optional(),
});

const listWorkoutsArgs = z.object({
  limit: z.number().int().min(1).max(50).optional(),
  type: z.string().optional(),
});

const listCoachesArgs = z.object({
  specialtyContains: z.string().optional(),
  limit: z.number().int().min(1).max(40).optional(),
});

const getCoachArgs = z.object({
  coachId: z.string().min(1),
});

const listNotificationsArgs = z.object({
  unreadOnly: z.boolean().optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

export async function executeClientAiTool(
  userId: string,
  name: string,
  rawArgs: string,
): Promise<string> {
  let args: unknown = {};
  if (rawArgs.trim()) {
    try {
      args = JSON.parse(rawArgs) as unknown;
    } catch {
      return JSON.stringify({ error: "Invalid tool arguments JSON" });
    }
  }

  switch (name) {
    case "get_account_snapshot": {
      const kb = await buildClientKnowledgeBase(userId);
      return JSON.stringify(kb ?? { error: "Profile not found" });
    }

    case "list_my_bookings": {
      const parsed = listBookingsArgs.parse(args);
      const limit = parsed.limit ?? 25;
      const statusFilter =
        parsed.status && parsed.status !== "all"
          ? { status: parsed.status.toUpperCase() as "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" }
          : {};

      const rows = await prisma.booking.findMany({
        where: { clientUserId: userId, ...statusFilter },
        orderBy: { startsAt: "desc" },
        take: limit,
        include: {
          service: { select: { title: true, durationMinutes: true } },
          trainerProfile: {
            select: { id: true, fullName: true, specialty: true },
          },
          review: { select: { rating: true, comment: true } },
        },
      });

      return JSON.stringify(
        rows.map((b) => ({
          id: b.id,
          status: b.status.toLowerCase(),
          startsAt: b.startsAt.toISOString(),
          endsAt: b.endsAt.toISOString(),
          priceCents: b.priceCents,
          notes: b.notes,
          service: b.service.title,
          coachName: b.trainerProfile.fullName,
          coachId: b.trainerProfile.id,
        })),
      );
    }

    case "list_my_workouts": {
      const parsed = listWorkoutsArgs.parse(args);
      const profile = await prisma.clientProfile.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!profile) {
        return JSON.stringify({ error: "Profile not found" });
      }

      const rows = await prisma.clientWorkout.findMany({
        where: {
          clientProfileId: profile.id,
          ...(parsed.type
            ? { type: { contains: parsed.type, mode: "insensitive" as const } }
            : {}),
        },
        orderBy: { workoutDate: "desc" },
        take: parsed.limit ?? 25,
      });

      return JSON.stringify(
        rows.map((w) => ({
          date: w.workoutDate.toISOString(),
          type: w.type,
          durationMin: w.durationMin,
          calories: w.calories,
          trainerNote: w.trainerNote,
        })),
      );
    }

    case "list_coaches": {
      const parsed = listCoachesArgs.parse(args);
      const coaches = await prisma.trainerProfile.findMany({
        where: parsed.specialtyContains
          ? {
              specialty: {
                contains: parsed.specialtyContains,
                mode: "insensitive",
              },
            }
          : undefined,
        take: parsed.limit ?? 15,
        include: {
          reviews: { select: { rating: true } },
          services: {
            where: { isActive: true },
            select: { title: true, priceCents: true, durationMinutes: true },
          },
        },
      });

      return JSON.stringify(
        coaches.map((c) => {
          const ratings = c.reviews.map((r) => r.rating);
          const avg =
            ratings.length > 0
              ? Math.round(
                  (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10,
                ) / 10
              : null;
          return {
            id: c.id,
            fullName: c.fullName,
            specialty: c.specialty,
            bio: c.bio,
            yearsExperience: c.yearsExperience,
            averageRating: avg,
            reviewCount: ratings.length,
            services: c.services,
          };
        }),
      );
    }

    case "get_coach_details": {
      const { coachId } = getCoachArgs.parse(args);
      const from = new Date();
      const to = new Date(from.getTime() + 60 * 24 * 60 * 60 * 1000);

      const coach = await prisma.trainerProfile.findUnique({
        where: { id: coachId },
        include: {
          reviews: {
            orderBy: { createdAt: "desc" },
            take: 15,
            select: { authorName: true, rating: true, comment: true, createdAt: true },
          },
          services: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
          weeklyAvailability: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
          availabilitySlots: {
            where: {
              startsAt: { gte: from, lte: to },
              OR: [{ booking: null }, { booking: { status: "CANCELLED" } }],
            },
            orderBy: { startsAt: "asc" },
            take: 24,
            select: { startsAt: true, endsAt: true },
          },
        },
      });

      if (!coach) {
        return JSON.stringify({ error: "Coach not found" });
      }

      return JSON.stringify({
        id: coach.id,
        fullName: coach.fullName,
        specialty: coach.specialty,
        bio: coach.bio,
        yearsExperience: coach.yearsExperience,
        services: coach.services,
        weeklyAvailability: coach.weeklyAvailability,
        openSlots: coach.availabilitySlots.map((s) => ({
          startsAt: s.startsAt.toISOString(),
          endsAt: s.endsAt.toISOString(),
        })),
        reviews: coach.reviews.map((r) => ({
          authorName: r.authorName,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt.toISOString(),
        })),
      });
    }

    case "list_my_notifications": {
      const parsed = listNotificationsArgs.parse(args);
      const profile = await prisma.clientProfile.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!profile) {
        return JSON.stringify({ error: "Profile not found" });
      }

      const rows = await prisma.clientNotification.findMany({
        where: {
          clientProfileId: profile.id,
          ...(parsed.unreadOnly ? { readAt: null } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: parsed.limit ?? 20,
      });

      return JSON.stringify(
        rows.map((n) => ({
          title: n.title,
          body: n.body,
          tone: n.tone.toLowerCase(),
          read: n.readAt !== null,
          createdAt: n.createdAt.toISOString(),
        })),
      );
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}
