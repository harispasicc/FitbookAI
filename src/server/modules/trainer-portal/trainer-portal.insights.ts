import type { BookingStatus, ClientGoalKey } from "@prisma/client";

const GOAL_LABELS: Record<ClientGoalKey, string> = {
  LOSE: "Lose weight",
  MUSCLE: "Build muscle",
  CONDITIONING: "Improve conditioning",
  REHAB: "Rehab / mobility",
};

export type TrainerBookingForInsights = {
  id: string;
  status: BookingStatus;
  startsAt: Date;
  endsAt: Date;
  priceCents: number;
  createdAt: Date;
  updatedAt: Date;
  clientUserId: string;
  clientUser: {
    id: string;
    email: string;
    clientProfile: {
      fullName: string | null;
      headline: string | null;
      goals: {
        activeGoal: ClientGoalKey;
        pctLose: number;
        pctMuscle: number;
        pctConditioning: number;
        pctRehab: number;
      } | null;
    } | null;
  };
  service: { title: string };
};

export type TrainerClientSummary = {
  id: string;
  name: string;
  email: string;
  goal: string;
  sessions: number;
  notes: string;
  lastSession: string;
  nextSession: string;
  progressPct: number;
  status: "active" | "paused" | "trial";
};

export type TrainerAnalyticsSummary = {
  bookingsCount: number;
  revenue30dCents: number;
  revenue30dLabel: string;
  activeClients: number;
  retentionPct: number;
  aiRemindersGenerated: number;
  revenueTrend: number[];
  bookingsByWeekday: number[];
  bookingsTrend: number[];
  clientLoad: { active: number; paused: number; trial: number };
  recentActivity: { id: string; label: string; time: string }[];
};

function formatPriceCents(cents: number): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function formatSessionDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatSessionDateTime(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRelativeTime(d: Date): string {
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatSessionDate(d);
}

function goalLabel(booking: TrainerBookingForInsights): string {
  const goals = booking.clientUser.clientProfile?.goals;
  if (goals) {
    return GOAL_LABELS[goals.activeGoal] ?? "Coaching";
  }
  const headline = booking.clientUser.clientProfile?.headline?.trim();
  if (headline) return headline;
  return "Coaching";
}

function clientName(booking: TrainerBookingForInsights): string {
  return (
    booking.clientUser.clientProfile?.fullName ??
    booking.clientUser.email.split("@")[0] ??
    "Client"
  );
}

function progressFromGoals(
  booking: TrainerBookingForInsights,
  completedRatio: number,
): number {
  const goals = booking.clientUser.clientProfile?.goals;
  if (goals) {
    const key = goals.activeGoal;
    const map: Record<ClientGoalKey, number> = {
      LOSE: goals.pctLose,
      MUSCLE: goals.pctMuscle,
      CONDITIONING: goals.pctConditioning,
      REHAB: goals.pctRehab,
    };
    return Math.min(100, Math.max(0, map[key] ?? 0));
  }
  return Math.min(100, Math.round(completedRatio * 100));
}

function deriveStatus(
  nonCancelled: TrainerBookingForInsights[],
  upcoming: TrainerBookingForInsights[],
): TrainerClientSummary["status"] {
  if (nonCancelled.length <= 1) {
    return "trial";
  }

  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  if (upcoming.length > 0) {
    return "active";
  }

  const recent = nonCancelled.some(
    (b) =>
      now - b.startsAt.getTime() < thirtyDaysMs ||
      b.status === "CONFIRMED" ||
      b.status === "PENDING",
  );

  return recent ? "active" : "paused";
}

export function computeTrainerClients(
  bookings: TrainerBookingForInsights[],
  notesByClientId: Map<string, string> = new Map(),
): TrainerClientSummary[] {
  const byClient = new Map<string, TrainerBookingForInsights[]>();

  for (const booking of bookings) {
    const list = byClient.get(booking.clientUserId) ?? [];
    list.push(booking);
    byClient.set(booking.clientUserId, list);
  }

  const now = Date.now();

  return [...byClient.entries()]
    .map(([clientUserId, clientBookings]) => {
      const sorted = [...clientBookings].sort(
        (a, b) => b.startsAt.getTime() - a.startsAt.getTime(),
      );
      const nonCancelled = sorted.filter((b) => b.status !== "CANCELLED");
      const completed = nonCancelled.filter((b) => b.status === "COMPLETED");
      const upcoming = nonCancelled
        .filter(
          (b) =>
            (b.status === "PENDING" || b.status === "CONFIRMED") &&
            b.startsAt.getTime() > now,
        )
        .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

      const lastPast = nonCancelled
        .filter((b) => b.startsAt.getTime() <= now)
        .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())[0];

      const sample = sorted[0]!;
      const completedRatio =
        nonCancelled.length === 0 ? 0 : completed.length / nonCancelled.length;

      return {
        id: clientUserId,
        name: clientName(sample),
        email: sample.clientUser.email,
        goal: goalLabel(sample),
        sessions: nonCancelled.length,
        notes: notesByClientId.get(clientUserId) ?? "",
        lastSession: lastPast ? formatSessionDate(lastPast.startsAt) : "—",
        nextSession: upcoming[0]
          ? formatSessionDateTime(upcoming[0].startsAt)
          : "—",
        progressPct: progressFromGoals(sample, completedRatio),
        status: deriveStatus(nonCancelled, upcoming),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function computeClientAttendance(bookings: TrainerBookingForInsights[]) {
  const now = Date.now();
  const past = bookings.filter(
    (b) =>
      b.status !== "CANCELLED" &&
      b.startsAt.getTime() <= now &&
      (b.status === "CONFIRMED" || b.status === "COMPLETED" || b.status === "PENDING"),
  );
  if (past.length === 0) return { showRatePct: 0, completed: 0, total: 0 };

  const completed = past.filter((b) => b.status === "COMPLETED").length;
  const showRatePct = Math.round((completed / past.length) * 100);
  return { showRatePct, completed, total: past.length };
}

export function computeTrainerAnalytics(
  bookings: TrainerBookingForInsights[],
): TrainerAnalyticsSummary {
  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = new Date(now - thirtyDaysMs);

  const nonCancelled = bookings.filter((b) => b.status !== "CANCELLED");
  const recentNonCancelled = nonCancelled.filter(
    (b) => b.startsAt >= thirtyDaysAgo,
  );

  const revenue30dCents = bookings
    .filter(
      (b) =>
        b.startsAt >= thirtyDaysAgo &&
        (b.status === "CONFIRMED" || b.status === "COMPLETED"),
    )
    .reduce((sum, b) => sum + b.priceCents, 0);

  const clients = computeTrainerClients(bookings);
  const activeClients = clients.filter((c) => c.status === "active").length;

  const clientsWithRepeat = clients.filter((c) => c.sessions >= 2).length;
  const clientsTotal = clients.length;
  const retentionPct =
    clientsTotal === 0
      ? 0
      : Math.round((clientsWithRepeat / clientsTotal) * 100);

  const revenueTrend: number[] = [];
  const bookingsTrend: number[] = [];
  for (let w = 9; w >= 0; w--) {
    const weekEnd = new Date(now - w * 7 * 24 * 60 * 60 * 1000);
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekBookings = bookings.filter(
      (b) =>
        b.startsAt >= weekStart &&
        b.startsAt < weekEnd &&
        b.status !== "CANCELLED",
    );
    const weekRevenueCents = bookings
      .filter(
        (b) =>
          b.startsAt >= weekStart &&
          b.startsAt < weekEnd &&
          (b.status === "CONFIRMED" || b.status === "COMPLETED"),
      )
      .reduce((sum, b) => sum + b.priceCents, 0);
    bookingsTrend.push(weekBookings.length);
    revenueTrend.push(Math.round((weekRevenueCents / 100) * 10) / 10);
  }

  const bookingsByWeekday = [0, 0, 0, 0, 0, 0, 0];
  for (const b of nonCancelled) {
    const day = b.startsAt.getDay();
    const idx = day === 0 ? 6 : day - 1;
    bookingsByWeekday[idx]! += 1;
  }

  const clientLoad = {
    active: clients.filter((c) => c.status === "active").length,
    paused: clients.filter((c) => c.status === "paused").length,
    trial: clients.filter((c) => c.status === "trial").length,
  };

  const recentActivity = [...bookings]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 6)
    .map((b) => {
      const name = clientName(b);
      const when = formatSessionDateTime(b.startsAt);
      const statusLabel =
        b.status === "CONFIRMED"
          ? "confirmed"
          : b.status === "COMPLETED"
            ? "completed"
            : b.status === "CANCELLED"
              ? "cancelled"
              : "booked";
      return {
        id: b.id,
        label: `${name} ${statusLabel} · ${b.service.title} (${when})`,
        time: formatRelativeTime(b.updatedAt),
      };
    });

  return {
    bookingsCount: recentNonCancelled.length,
    revenue30dCents,
    revenue30dLabel: formatPriceCents(revenue30dCents),
    activeClients,
    retentionPct,
    aiRemindersGenerated: 0,
    revenueTrend,
    bookingsByWeekday,
    bookingsTrend,
    clientLoad,
    recentActivity,
  };
}
