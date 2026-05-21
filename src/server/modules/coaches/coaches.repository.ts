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
  services: {
    where: { isActive: true },
    select: { id: true, priceCents: true },
  },
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

    const slotFilters: object[] = [
      { OR: [{ booking: null }, { booking: { status: "CANCELLED" } }] },
    ];
    if (query.serviceId) {
      slotFilters.push({
        OR: [{ serviceId: query.serviceId }, { serviceId: null }],
      });
    }

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
          AND: slotFilters,
        },
        orderBy: { startsAt: "asc" },
        take: query.limit,
      }),
    ]);

    return { weekly, slots };
  },

  async countDistinctClients(coachId: string) {
    const rows = await prisma.booking.findMany({
      where: {
        trainerProfileId: coachId,
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      select: { clientUserId: true },
      distinct: ["clientUserId"],
    });
    return rows.length;
  },

  async findFeaturedReviews(limit: number) {
    return prisma.trainerReview.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        trainerProfile: {
          select: { fullName: true, specialty: true },
        },
      },
    });
  },
};

export function buildCoachStats(
  coach: NonNullable<CoachWithStats>,
  clientsHelped?: number,
) {
  const priceCents = coach.services.map((s) => s.priceCents);
  return {
    averageRating: averageRating(coach.reviews),
    reviewCount: coach.reviews.length,
    serviceCount: coach.services.length,
    minPriceCents: priceCents.length > 0 ? Math.min(...priceCents) : null,
    yearsExperience: coach.yearsExperience,
    clientsHelped: clientsHelped ?? 0,
  };
}

function averageRating(ratings: { rating: number }[]): number | null {
  if (ratings.length === 0) return null;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}
