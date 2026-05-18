import type {
  TrainerAvailabilitySlot,
  TrainerProfile,
  TrainerReview,
  TrainerService,
  TrainerWeeklyAvailability,
  User,
} from "@prisma/client";

type TrainerWithUser = TrainerProfile & {
  user: Pick<User, "id" | "email">;
};

type CoachStats = {
  averageRating: number | null;
  reviewCount: number;
  serviceCount: number;
};

function formatPriceCents(cents: number): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function toCoachListItemDto(
  coach: TrainerWithUser,
  stats: CoachStats,
) {
  return {
    id: coach.id,
    userId: coach.userId,
    fullName: coach.fullName,
    bio: coach.bio,
    specialty: coach.specialty,
    user: coach.user,
    stats,
  };
}

export function toCoachDetailDto(
  coach: TrainerWithUser,
  stats: CoachStats,
) {
  return toCoachListItemDto(coach, stats);
}

export function toCoachServiceDto(service: TrainerService) {
  return {
    id: service.id,
    title: service.title,
    description: service.description,
    durationMinutes: service.durationMinutes,
    priceCents: service.priceCents,
    priceLabel: formatPriceCents(service.priceCents),
    isActive: service.isActive,
    sortOrder: service.sortOrder,
  };
}

export function toCoachReviewDto(review: TrainerReview) {
  return {
    id: review.id,
    authorName: review.authorName,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
  };
}

export function toCoachAvailabilityDto(
  weekly: TrainerWeeklyAvailability[],
  slots: TrainerAvailabilitySlot[],
) {
  const weeklyByDay = new Map<number, TrainerWeeklyAvailability[]>();
  for (const row of weekly) {
    const list = weeklyByDay.get(row.dayOfWeek) ?? [];
    list.push(row);
    weeklyByDay.set(row.dayOfWeek, list);
  }

  const weeklySchedule = [...weeklyByDay.entries()]
    .sort(([a], [b]) => a - b)
    .map(([dayOfWeek, windows]) => ({
      dayOfWeek,
      dayLabel: DAY_LABELS[dayOfWeek] ?? `Day ${dayOfWeek}`,
      windows: windows.map((w) => ({
        startTime: w.startTime,
        endTime: w.endTime,
      })),
    }));

  return {
    weekly: weeklySchedule,
    upcomingSlots: slots.map((slot) => ({
      id: slot.id,
      startsAt: slot.startsAt.toISOString(),
      endsAt: slot.endsAt.toISOString(),
      isBooked: slot.isBooked,
      label: formatSlotLabel(slot.startsAt),
    })),
  };
}

function formatSlotLabel(startsAt: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(startsAt);
}
