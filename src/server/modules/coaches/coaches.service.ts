import { ApiError } from "@/server/http/api-error";
import {
  buildCoachStats,
  coachesRepository,
  type ListAvailabilityQuery,
  type ListCoachesQuery,
  type ListReviewsQuery,
} from "@/server/modules/coaches/coaches.repository";
import {
  toCoachAvailabilityDto,
  toCoachDetailDto,
  toCoachListItemDto,
  toCoachReviewDto,
  toCoachServiceDto,
} from "@/server/modules/coaches/coaches.dto";

async function requireCoach(coachId: string) {
  const coach = await coachesRepository.findById(coachId);
  if (!coach) {
    throw ApiError.notFound("Coach not found");
  }
  return coach;
}

export const coachesService = {
  async listCoaches(query: ListCoachesQuery) {
    const { coaches, total } = await coachesRepository.findMany(query);

    return {
      items: coaches.map((coach) =>
        toCoachListItemDto(coach, buildCoachStats(coach)),
      ),
      meta: {
        total,
        limit: query.limit,
        offset: query.offset,
      },
    };
  },

  async getCoachById(coachId: string) {
    const coach = await requireCoach(coachId);
    return toCoachDetailDto(coach, buildCoachStats(coach));
  },

  async getCoachServices(coachId: string) {
    await requireCoach(coachId);
    const services = await coachesRepository.findServices(coachId);
    return services.map(toCoachServiceDto);
  },

  async getCoachReviews(coachId: string, query: ListReviewsQuery) {
    await requireCoach(coachId);
    const { reviews, total } = await coachesRepository.findReviews(
      coachId,
      query,
    );

    return {
      items: reviews.map(toCoachReviewDto),
      meta: {
        total,
        limit: query.limit,
        offset: query.offset,
      },
    };
  },

  async getCoachAvailability(coachId: string, query: ListAvailabilityQuery) {
    await requireCoach(coachId);
    const { weekly, slots } = await coachesRepository.findAvailability(
      coachId,
      query,
    );
    return toCoachAvailabilityDto(weekly, slots);
  },
};
