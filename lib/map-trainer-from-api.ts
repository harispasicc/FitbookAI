import type { CoachSpecialization } from "@/lib/coach-specializations";
import type { MockTrainer } from "@/lib/mock-trainers";
import { trainerAvatarUrls } from "@/lib/media-urls";

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
  stats?: {
    averageRating: number | null;
    reviewCount: number;
    serviceCount: number;
  };
};

function avatarIndexFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i)) % trainerAvatarUrls.length;
  }
  return hash;
}

export function mapTrainerProfileFromApi(profile: ApiTrainerProfile): MockTrainer {
  const name = profile.fullName?.trim() || profile.user.email;
  const specialty = profile.specialty?.trim() || "Coaching";
  const bio = profile.bio?.trim() || "";

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
    priceFrom: "—",
    avatarIndex: avatarIndexFromId(profile.id),
    yearsExperience: 0,
    clientsHelped: 0,
    certifications: [],
    languages: ["English"],
    sessionLengthsMin: [60],
    nextOpenSlots: [],
    weeklyHours: ["—", "—", "—", "—", "—", "—", "—"],
    services: [],
    reviews: [],
  };
}
