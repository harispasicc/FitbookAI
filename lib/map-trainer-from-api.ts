import type { CoachSpecialization } from "@/lib/coach-specializations";
import type { MockTrainer } from "@/lib/mock-trainers";
import { trainerAvatarUrls } from "@/lib/media-urls";

export type ApiCoachReview = {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type ApiCoachService = {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
  priceLabel: string;
  isActive: boolean;
  sortOrder: number;
};

export type ApiWeeklyWindow = {
  startTime: string;
  endTime: string;
};

export type ApiWeeklyDay = {
  dayOfWeek: number;
  dayLabel: string;
  windows: ApiWeeklyWindow[];
};

export type ApiCoachAvailability = {
  weekly: ApiWeeklyDay[];
  upcomingSlots: {
    id: string;
    serviceId: string | null;
    startsAt: string;
    endsAt: string;
    isBooked: boolean;
    label: string;
  }[];
};

export type ApiTrainerProfile = {
  id: string;
  userId: string;
  fullName: string | null;
  bio: string | null;
  specialty: string | null;
  user: {
    id: string;
    email: string;
  };
  yearsExperience?: number;
  stats?: {
    averageRating: number | null;
    reviewCount: number;
    serviceCount: number;
    minPriceCents?: number | null;
    yearsExperience?: number;
    clientsHelped?: number;
  };
  reviews?: ApiCoachReview[];
  services?: ApiCoachService[];
  availability?: ApiCoachAvailability;
};

function formatReviewDate(iso: string) {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const diffDay = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDay < 1) return "Today";
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function formatPriceFromCents(cents: number | null | undefined): string {
  if (cents == null) return "—";
  const euros = cents / 100;
  return euros % 1 === 0 ? `€${euros}` : `€${euros.toFixed(2)}`;
}

function avatarIndexFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i)) % trainerAvatarUrls.length;
  }
  return hash;
}

function weeklyHoursFromApi(weekly: ApiWeeklyDay[] | undefined): MockTrainer["weeklyHours"] {
  const byDow = new Map<number, string>();
  for (const day of weekly ?? []) {
    const hours =
      day.windows.length === 0
        ? "—"
        : day.windows.map((w) => `${w.startTime}–${w.endTime}`).join(", ");
    byDow.set(day.dayOfWeek, hours);
  }
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order.map((dow) => byDow.get(dow) ?? "—") as MockTrainer["weeklyHours"];
}

export function mapTrainerProfileFromApi(profile: ApiTrainerProfile): MockTrainer {
  const name = profile.fullName?.trim() || profile.user.email;
  const specialty = profile.specialty?.trim() || "Coaching";
  const bio = profile.bio?.trim() || "";
  const services = (profile.services ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    price: s.priceLabel,
    blurb: s.description?.trim() || "",
    durationMin: s.durationMinutes,
  }));

  const sessionLengths = [
    ...new Set(services.map((s) => s.durationMin)),
  ].sort((a, b) => a - b);

  const nextOpen = (profile.availability?.upcomingSlots ?? [])
    .slice(0, 4)
    .map((s) => s.label);

  return {
    id: profile.id,
    name,
    headline: specialty,
    bio,
    longBio: bio,
    categories: [specialty],
    specializations: [specialty as CoachSpecialization],
    bestFor: [],
    deliveryModes: ["online"],
    locationLabel: "Online",
    rating: profile.stats?.averageRating ?? 5,
    reviewCount: profile.stats?.reviewCount ?? 0,
    priceFrom: formatPriceFromCents(profile.stats?.minPriceCents),
    avatarIndex: avatarIndexFromId(profile.id),
    yearsExperience:
      profile.yearsExperience ?? profile.stats?.yearsExperience ?? 0,
    clientsHelped: profile.stats?.clientsHelped ?? 0,
    certifications: [],
    languages: ["English"],
    sessionLengthsMin: sessionLengths.length > 0 ? sessionLengths : [60],
    nextOpenSlots: nextOpen,
    weeklyHours: weeklyHoursFromApi(profile.availability?.weekly),
    services,
    reviews: (profile.reviews ?? []).map((r) => ({
      id: r.id,
      author: r.authorName,
      rating: r.rating,
      text: r.comment?.trim() || "",
      dateLabel: formatReviewDate(r.createdAt),
    })),
  };
}
