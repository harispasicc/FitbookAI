import { prisma } from "@/lib/prisma";
import { parseGoalNotes } from "@/server/modules/client-portal/goal-notes";
import { readGoalCustomNotes } from "@/server/modules/client-portal/goal-notes-db";
import { prismaGoalToApi } from "@/server/modules/client-portal/client-portal.dto";

const BOOKING_LIMIT = 80;
const WORKOUT_LIMIT = 40;
const NOTIFICATION_LIMIT = 30;
const COACH_SLOT_LIMIT = 24;
const COACH_REVIEW_LIMIT = 20;
const COACH_CATALOG_LIMIT = 40;
const AVAILABILITY_DAYS = 60;

const GOAL_LABELS: Record<string, string> = {
  lose: "Lose weight",
  muscle: "Build muscle",
  conditioning: "Improve conditioning",
  rehab: "Rehab / mobility",
};

function averageRating(ratings: { rating: number }[]): number | null {
  if (ratings.length === 0) return null;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

function mapBooking(b: {
  id: string;
  status: string;
  startsAt: Date;
  endsAt: Date;
  priceCents: number;
  notes: string | null;
  service: { title: string; durationMinutes: number };
  trainerProfile: { id: string; fullName: string | null; specialty: string | null };
  review?: { rating: number; comment: string | null } | null;
}) {
  return {
    id: b.id,
    status: b.status.toLowerCase(),
    startsAt: b.startsAt.toISOString(),
    endsAt: b.endsAt.toISOString(),
    priceCents: b.priceCents,
    notes: b.notes,
    service: b.service.title,
    serviceDurationMin: b.service.durationMinutes,
    coachId: b.trainerProfile.id,
    coachName: b.trainerProfile.fullName,
    coachSpecialty: b.trainerProfile.specialty,
    myReview: b.review
      ? { rating: b.review.rating, comment: b.review.comment }
      : null,
  };
}

function mapCoachSummary(coach: {
  id: string;
  fullName: string | null;
  bio: string | null;
  specialty: string | null;
  yearsExperience: number;
  reviews: { rating: number }[];
  services: {
    title: string;
    description: string | null;
    priceCents: number;
    durationMinutes: number;
  }[];
}) {
  const prices = coach.services.map((s) => s.priceCents);
  return {
    id: coach.id,
    fullName: coach.fullName,
    specialty: coach.specialty,
    bio: coach.bio,
    yearsExperience: coach.yearsExperience,
    averageRating: averageRating(coach.reviews),
    reviewCount: coach.reviews.length,
    minPriceCents: prices.length > 0 ? Math.min(...prices) : null,
    services: coach.services.map((s) => ({
      title: s.title,
      description: s.description,
      priceCents: s.priceCents,
      durationMinutes: s.durationMinutes,
    })),
  };
}

export async function buildClientKnowledgeBase(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      clientProfile: {
        include: {
          goals: true,
          notifications: {
            orderBy: { createdAt: "desc" },
            take: NOTIFICATION_LIMIT,
          },
        },
      },
    },
  });

  const profile = user?.clientProfile;
  if (!profile) {
    return null;
  }

  const customNotesRaw = await readGoalCustomNotes(profile.id);
  const goalNotes = parseGoalNotes(customNotesRaw);

  const from = new Date();
  const availabilityTo = new Date(
    from.getTime() + AVAILABILITY_DAYS * 24 * 60 * 60 * 1000,
  );

  const [
    allBookings,
    allWorkouts,
    coachesCatalog,
    selectedCoach,
    myReviews,
  ] = await Promise.all([
    prisma.booking.findMany({
      where: { clientUserId: userId },
      orderBy: { startsAt: "desc" },
      take: BOOKING_LIMIT,
      include: {
        service: { select: { title: true, durationMinutes: true } },
        trainerProfile: {
          select: { id: true, fullName: true, specialty: true },
        },
        review: { select: { rating: true, comment: true } },
      },
    }),
    prisma.clientWorkout.findMany({
      where: { clientProfileId: profile.id },
      orderBy: { workoutDate: "desc" },
      take: WORKOUT_LIMIT,
    }),
    prisma.trainerProfile.findMany({
      take: COACH_CATALOG_LIMIT,
      include: {
        reviews: { select: { rating: true, comment: true, authorName: true } },
        services: {
          where: { isActive: true },
          select: {
            title: true,
            description: true,
            priceCents: true,
            durationMinutes: true,
          },
          orderBy: { sortOrder: "asc" },
        },
        weeklyAvailability: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
    }),
    profile.selectedTrainerProfileId
      ? prisma.trainerProfile.findUnique({
          where: { id: profile.selectedTrainerProfileId },
          include: {
            reviews: {
              orderBy: { createdAt: "desc" },
              take: COACH_REVIEW_LIMIT,
              select: {
                rating: true,
                comment: true,
                authorName: true,
                createdAt: true,
              },
            },
            services: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
            },
            weeklyAvailability: {
              orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
            },
            availabilitySlots: {
              where: {
                startsAt: { gte: from, lte: availabilityTo },
                OR: [
                  { booking: null },
                  { booking: { status: "CANCELLED" } },
                ],
              },
              orderBy: { startsAt: "asc" },
              take: COACH_SLOT_LIMIT,
              select: { startsAt: true, endsAt: true, isBooked: true },
            },
          },
        })
      : Promise.resolve(null),
    prisma.trainerReview.findMany({
      where: { clientUserId: userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        trainerProfile: { select: { fullName: true } },
      },
    }),
  ]);

  const bookings = allBookings.map(mapBooking);
  const now = Date.now();
  const bookingStats = {
    total: bookings.length,
    upcoming: bookings.filter(
      (b) =>
        new Date(b.startsAt).getTime() >= now &&
        (b.status === "pending" || b.status === "confirmed"),
    ).length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const workouts = allWorkouts.map((w) => ({
    date: w.workoutDate.toISOString(),
    type: w.type,
    durationMin: w.durationMin,
    calories: w.calories,
    trainerNote: w.trainerNote,
  }));

  const workoutStats = {
    count: workouts.length,
    totalMinutes: workouts.reduce((s, w) => s + w.durationMin, 0),
    totalCalories: workouts.reduce((s, w) => s + w.calories, 0),
  };

  const goals = profile.goals
    ? {
        active: prismaGoalToApi(profile.goals.activeGoal),
        activeLabel: GOAL_LABELS[prismaGoalToApi(profile.goals.activeGoal)],
        pct: {
          lose: profile.goals.pctLose,
          muscle: profile.goals.pctMuscle,
          conditioning: profile.goals.pctConditioning,
          rehab: profile.goals.pctRehab,
        },
        notes: goalNotes,
        updatedAt: profile.goals.updatedAt.toISOString(),
      }
    : null;

  const notifications = profile.notifications.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    tone: n.tone.toLowerCase(),
    read: n.readAt !== null,
    createdAt: n.createdAt.toISOString(),
  }));

  const coaches = coachesCatalog.map(mapCoachSummary);

  const selectedCoachDetail = selectedCoach
    ? {
        ...mapCoachSummary(selectedCoach),
        weeklyAvailability: selectedCoach.weeklyAvailability.map((w) => ({
          dayOfWeek: w.dayOfWeek,
          startTime: w.startTime,
          endTime: w.endTime,
        })),
        openSlots: selectedCoach.availabilitySlots.map((s) => ({
          startsAt: s.startsAt.toISOString(),
          endsAt: s.endsAt.toISOString(),
        })),
        recentReviews: selectedCoach.reviews.map((r) => ({
          authorName: r.authorName,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt.toISOString(),
        })),
      }
    : null;

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      userId,
      email: user.email,
      dataScope:
        "Your account, bookings, workouts, goals, notifications, reviews you wrote, and the public coach catalog on FitBook.",
    },
    profile: {
      id: profile.id,
      fullName: profile.fullName,
      headline: profile.headline,
      phone: profile.phone,
      city: profile.city,
      timezone: profile.timezone,
      bio: profile.bio,
      selectedCoachId: profile.selectedTrainerProfileId,
    },
    goals,
    bookings: { stats: bookingStats, items: bookings },
    workouts: { stats: workoutStats, items: workouts },
    notifications: {
      unread: notifications.filter((n) => !n.read).length,
      items: notifications,
    },
    reviewsIWritten: myReviews.map((r) => ({
      coachName: r.trainerProfile.fullName,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    })),
    selectedCoach: selectedCoachDetail,
    coachesCatalog: coaches,
    appNavigation: {
      findCoaches: "/coaches",
      mySessions: "/me/sessions",
      myProgress: "/me/progress",
      myProfile: "/me/profile",
      bookCoach: "Open a coach profile → Book a session",
    },
  };
}

export type ClientKnowledgeBase = NonNullable<
  Awaited<ReturnType<typeof buildClientKnowledgeBase>>
>;
