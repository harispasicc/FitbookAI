import { prisma } from "@/lib/prisma";
import type {
  listAvailabilityQuerySchema,
  listCoachesQuerySchema,
  listReviewsQuerySchema,
} from "@/server/modules/coaches/coaches.schemas";
import type { z } from "zod";

export type ListCoachesQuery = z.infer<typeof listCoachesQuerySchema>;
export type ListReviewsQuery = z.infer<typeof listReviewsQuerySchema>;
export type ListAvailabilityQuery = z.infer<typeof listAvailabilityQuerySchema>;

const coachWithStatsInclude = {
  user: { select: { id: true, email: true } },
  reviews: { select: { rating: true } },
  services: { where: { isActive: true }, select: { id: true } },
} as const;

export type CoachWithStats = Awaited<
  ReturnType<typeof coachesRepository.findById>
>;

export const coachesRepository = {
  async findMany(query: ListCoachesQuery) {
    const where = query.specialty
      ? {
          specialty: {
            contains: query.specialty,
            mode: "insensitive" as const,
          },
        }
      : undefined;

    const [coaches, total] = await Promise.all([
      prisma.trainerProfile.findMany({
        where,
        include: coachWithStatsInclude,
        orderBy: { id: "desc" },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.trainerProfile.count({ where }),
    ]);

    return { coaches, total };
  },

  async findById(coachId: string) {
    return prisma.trainerProfile.findUnique({
      where: { id: coachId },
      include: coachWithStatsInclude,
    });
  },

  async findServices(coachId: string) {
    return prisma.trainerService.findMany({
      where: { trainerProfileId: coachId, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  },

  async findReviews(coachId: string, query: ListReviewsQuery) {
    const where = { trainerProfileId: coachId };

    const [reviews, total] = await Promise.all([
      prisma.trainerReview.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.trainerReview.count({ where }),
    ]);

    return { reviews, total };
  },

  async findAvailability(coachId: string, query: ListAvailabilityQuery) {
    const from = query.from ?? new Date();
    const to =
      query.to ?? new Date(from.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [weekly, slots] = await Promise.all([
      prisma.trainerWeeklyAvailability.findMany({
        where: { trainerProfileId: coachId },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      }),
      prisma.trainerAvailabilitySlot.findMany({
        where: {
          trainerProfileId: coachId,
          isBooked: false,
          startsAt: { gte: from, lte: to },
        },
        orderBy: { startsAt: "asc" },
        take: query.limit,
      }),
    ]);

    return { weekly, slots };
  },
};

export function buildCoachStats(coach: NonNullable<CoachWithStats>) {
  return {
    averageRating: averageRating(coach.reviews),
    reviewCount: coach.reviews.length,
    serviceCount: coach.services.length,
  };
}

function averageRating(ratings: { rating: number }[]): number | null {
  if (ratings.length === 0) return null;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}
