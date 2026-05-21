import { prismaPlanToApp } from "@/lib/trainer-plans";
import type {
  TrainerAvailabilitySlot,
  TrainerProfile,
  TrainerService,
  User,
} from "@prisma/client";

function formatPriceCents(cents: number): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

type TrainerWithUser = TrainerProfile & {
  user: Pick<User, "id" | "email">;
};

export function toTrainerProfileDto(profile: TrainerWithUser) {
  return {
    id: profile.id,
    userId: profile.userId,
    email: profile.user.email,
    fullName: profile.fullName,
    specialty: profile.specialty,
    bio: profile.bio,
    yearsExperience: profile.yearsExperience,
    plan: prismaPlanToApp(profile.plan ?? "FREE"),
  };
}

export function toTrainerServiceDto(service: TrainerService) {
  return {
    id: service.id,
    title: service.title,
    description: service.description,
    durationMinutes: service.durationMinutes,
    priceCents: service.priceCents,
    priceLabel: formatPriceCents(service.priceCents),
    isActive: service.isActive,
    sortOrder: service.sortOrder,
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
  };
}

function formatSlotLabel(startsAt: Date): string {
  return startsAt.toLocaleString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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

export type WeeklyDayDto = {
  dayOfWeek: number;
  dayLabel: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
};

export function buildWeeklySchedule(
  stored: { dayOfWeek: number; startTime: string; endTime: string }[],
): WeeklyDayDto[] {
  const byDay = new Map(stored.map((r) => [r.dayOfWeek, r]));

  return DAY_LABELS.map((dayLabel, dayOfWeek) => {
    const row = byDay.get(dayOfWeek);
    return {
      dayOfWeek,
      dayLabel,
      enabled: Boolean(row),
      startTime: row?.startTime ?? "09:00",
      endTime: row?.endTime ?? "17:00",
    };
  });
}

export function toTrainerAvailabilitySlotDto(slot: TrainerAvailabilitySlot) {
  return {
    id: slot.id,
    serviceId: slot.serviceId,
    startsAt: slot.startsAt.toISOString(),
    endsAt: slot.endsAt.toISOString(),
    isBooked: slot.isBooked,
    label: formatSlotLabel(slot.startsAt),
  };
}
