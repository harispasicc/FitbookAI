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

export type KpiTrendDto = {
  label: string;
  direction: "up" | "down" | "neutral";
  show: boolean;
};

export type TodaySessionDto = {
  id: string;
  clientName: string;
  service: string;
  startsAt: string;
  status: string;
  timeLabel: string;
};

export type FollowUpClientDto = {
  id: string;
  name: string;
  reason: string;
};

export type ActivityFeedItemDto = {
  id: string;
  type: "booked" | "confirmed" | "completed" | "cancelled" | "review" | "goal" | "ai";
  title: string;
  subtitle: string;
  time: string;
  clientName: string;
};

export type ClientInsightRowDto = {
  id: string;
  name: string;
  meta: string;
  value: string;
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
  recentActivity: ActivityFeedItemDto[];
  today: {
    upcomingSessions: TodaySessionDto[];
    pendingConfirmations: number;
    followUpClients: FollowUpClientDto[];
    nextSession: {
      id: string;
      clientName: string;
      service: string;
      startsAt: string;
      minutesUntil: number;
      timeLabel: string;
    } | null;
  };
  kpiTrends: {
    revenue: KpiTrendDto;
    bookings: KpiTrendDto;
    activeClients: KpiTrendDto;
    retention: KpiTrendDto;
    aiInsights: KpiTrendDto;
  };
  growth: {
    revenueTrend: number[];
    sessionsCompletedPerWeek: number[];
    clientGrowthPerWeek: number[];
    bookingConversionPct: number;
    peakWeekdays: number[];
    peakHours: { label: string; count: number }[];
    chartRevenueTrend: number[];
    chartSessionsCompleted: number[];
    chartClientGrowth: number[];
    chartPeakWeekdays: number[];
    usesHistoricalSeed: boolean;
  };
  intelligence: {
    headline: string;
    recommendations: {
      id: string;
      title: string;
      detail: string;
      href: string;
      tone: "warning" | "success" | "neutral";
    }[];
  };
  clientInsights: {
    mostActive: ClientInsightRowDto[];
    inactive: ClientInsightRowDto[];
    churnRisk: ClientInsightRowDto[];
    avgSessionsPerClient: number;
    returningClientPct: number;
    sessionStreaks: { clientName: string; streak: number }[];
  };
  smartInsights: string[];
  emptyHints: {
    retention: string | null;
    revenueTrend: string | null;
    conversion: string | null;
  };
  highlights: {
    bestService: string | null;
    bestServiceBookings: number;
    peakDayName: string | null;
    peakDaySharePct: number;
    peakHourLabel: string | null;
    peakHourSharePct: number;
    revenueVsPriorPeriodPct: number | null;
    bestWeekRevenueEur: number;
    completedSessions30d: number;
  };
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

  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const WEEK_COUNT = 12;

  const revenueTrend: number[] = [];
  const bookingsTrend: number[] = [];
  const sessionsCompletedPerWeek: number[] = [];
  const clientGrowthPerWeek: number[] = [];
  const seenClientsByWeek: string[][] = [];

  for (let w = WEEK_COUNT - 1; w >= 0; w--) {
    const weekEnd = new Date(now - w * WEEK_MS);
    const weekStart = new Date(weekEnd.getTime() - WEEK_MS);
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
    const weekCompleted = weekBookings.filter((b) => b.status === "COMPLETED").length;
    const weekClientIds = [
      ...new Set(weekBookings.map((b) => b.clientUserId)),
    ];

    bookingsTrend.push(weekBookings.length);
    revenueTrend.push(Math.round((weekRevenueCents / 100) * 10) / 10);
    sessionsCompletedPerWeek.push(weekCompleted);
    seenClientsByWeek.push(weekClientIds);
  }

  const cumulativeClients = new Set<string>();
  for (const ids of seenClientsByWeek) {
    for (const id of ids) cumulativeClients.add(id);
    clientGrowthPerWeek.push(cumulativeClients.size);
  }

  const bookingsByWeekday = [0, 0, 0, 0, 0, 0, 0];
  const hourBuckets = [
    { label: "6–9", count: 0 },
    { label: "9–12", count: 0 },
    { label: "12–15", count: 0 },
    { label: "15–18", count: 0 },
    { label: "18–21", count: 0 },
    { label: "21+", count: 0 },
  ];

  for (const b of nonCancelled) {
    const day = b.startsAt.getDay();
    const idx = day === 0 ? 6 : day - 1;
    bookingsByWeekday[idx]! += 1;
    const hour = b.startsAt.getHours();
    if (hour < 9) hourBuckets[0]!.count += 1;
    else if (hour < 12) hourBuckets[1]!.count += 1;
    else if (hour < 15) hourBuckets[2]!.count += 1;
    else if (hour < 18) hourBuckets[3]!.count += 1;
    else if (hour < 21) hourBuckets[4]!.count += 1;
    else hourBuckets[5]!.count += 1;
  }

  const clientLoad = {
    active: clients.filter((c) => c.status === "active").length,
    paused: clients.filter((c) => c.status === "paused").length,
    trial: clients.filter((c) => c.status === "trial").length,
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const upcomingToday = nonCancelled
    .filter((b) => b.startsAt >= todayStart && b.startsAt <= todayEnd)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .map((b) => ({
      id: b.id,
      clientName: clientName(b),
      service: b.service.title,
      startsAt: b.startsAt.toISOString(),
      status: b.status.toLowerCase(),
      timeLabel: b.startsAt.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    }));

  const pendingConfirmations = bookings.filter((b) => b.status === "PENDING").length;

  const fourteenDaysAgo = now - 14 * DAY_MS;
  const followUpClients = clients
    .filter((c) => {
      const clientBookings = bookings.filter((b) => b.clientUserId === c.id);
      const last = clientBookings
        .filter((b) => b.status !== "CANCELLED")
        .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())[0];
      if (!last) return false;
      const hasUpcoming = clientBookings.some(
        (b) =>
          (b.status === "PENDING" || b.status === "CONFIRMED") &&
          b.startsAt.getTime() > now,
      );
      return !hasUpcoming && last.startsAt.getTime() < fourteenDaysAgo;
    })
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      name: c.name,
      reason: "No booking in 14+ days",
    }));

  const nextUpcoming = nonCancelled
    .filter(
      (b) =>
        (b.status === "PENDING" || b.status === "CONFIRMED") &&
        b.startsAt.getTime() > now,
    )
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0];

  const nextSession = nextUpcoming
    ? {
        id: nextUpcoming.id,
        clientName: clientName(nextUpcoming),
        service: nextUpcoming.service.title,
        startsAt: nextUpcoming.startsAt.toISOString(),
        minutesUntil: Math.max(
          0,
          Math.round((nextUpcoming.startsAt.getTime() - now) / 60_000),
        ),
        timeLabel: formatSessionDateTime(nextUpcoming.startsAt),
      }
    : null;

  const prevThirtyStart = new Date(now - 60 * DAY_MS);
  const prevThirtyEnd = thirtyDaysAgo;

  const revenuePrev30dCents = bookings
    .filter(
      (b) =>
        b.startsAt >= prevThirtyStart &&
        b.startsAt < prevThirtyEnd &&
        (b.status === "CONFIRMED" || b.status === "COMPLETED"),
    )
    .reduce((sum, b) => sum + b.priceCents, 0);

  const revenueDelta = pctDelta(revenue30dCents, revenuePrev30dCents);
  const thisWeekStart = new Date(now - 7 * DAY_MS);
  const lastWeekStart = new Date(now - 14 * DAY_MS);
  const bookingsThisWeek = nonCancelled.filter((b) => b.startsAt >= thisWeekStart).length;
  const bookingsLastWeek = nonCancelled.filter(
    (b) => b.startsAt >= lastWeekStart && b.startsAt < thisWeekStart,
  ).length;
  const bookingsDelta = pctDelta(bookingsThisWeek, bookingsLastWeek);

  const newClientsThisMonth = clients.filter((c) => {
    const first = bookings
      .filter((b) => b.clientUserId === c.id && b.status !== "CANCELLED")
      .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0];
    return first && first.startsAt >= thirtyDaysAgo;
  }).length;

  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;
  const confirmedRecent = bookings.filter(
    (b) =>
      b.startsAt >= thirtyDaysAgo &&
      (b.status === "CONFIRMED" || b.status === "COMPLETED"),
  ).length;
  const pendingRecent = bookings.filter(
    (b) => b.startsAt >= thirtyDaysAgo && b.status === "PENDING",
  ).length;
  const bookingConversionPct =
    confirmedRecent + pendingRecent === 0
      ? 0
      : Math.round((confirmedRecent / (confirmedRecent + pendingRecent)) * 100);

  const retentionPrev =
    clientsTotal === 0
      ? 0
      : Math.round(
          (clients.filter((c) => {
            const n = bookings.filter(
              (b) =>
                b.clientUserId === c.id &&
                b.status !== "CANCELLED" &&
                b.startsAt < thirtyDaysAgo,
            ).length;
            return n >= 2;
          }).length /
            clientsTotal) *
            100,
        );

  const kpiTrends = {
    revenue: {
      label:
        revenueDelta === null
          ? "First revenue window"
          : `${revenueDelta >= 0 ? "+" : ""}${revenueDelta}% vs prior 30d`,
      direction:
        revenueDelta === null || revenueDelta === 0
          ? ("neutral" as const)
          : revenueDelta > 0
            ? ("up" as const)
            : ("down" as const),
      show: completedCount >= 2 && revenuePrev30dCents > 0,
    },
    bookings: {
      label:
        bookingsDelta === null
          ? `${bookingsThisWeek} this week`
          : `${bookingsDelta >= 0 ? "+" : ""}${bookingsDelta}% this week`,
      direction:
        bookingsDelta === null || bookingsDelta === 0
          ? ("neutral" as const)
          : bookingsDelta > 0
            ? ("up" as const)
            : ("down" as const),
      show: bookingsThisWeek + bookingsLastWeek >= 3,
    },
    activeClients: {
      label:
        newClientsThisMonth === 0
          ? "No new clients yet"
          : `${newClientsThisMonth} new this month`,
      direction: newClientsThisMonth > 0 ? ("up" as const) : ("neutral" as const),
      show: newClientsThisMonth > 0,
    },
    retention: {
      label:
        retentionPct >= retentionPrev
          ? `+${retentionPct - retentionPrev} pts vs prior`
          : `${retentionPct - retentionPrev} pts vs prior`,
      direction:
        retentionPct > retentionPrev
          ? ("up" as const)
          : retentionPct < retentionPrev
            ? ("down" as const)
            : ("neutral" as const),
      show: clientsTotal >= 3 && completedCount >= 2,
    },
    aiInsights: {
      label: "AI usage tracking",
      direction: "neutral" as const,
      show: false,
    },
  };

  const avgSessionsPerClient =
    clientsTotal === 0
      ? 0
      : Math.round(
          (nonCancelled.length / clientsTotal) * 10,
        ) / 10;

  const returningClientPct = retentionPct;

  const mostActive = [...clients]
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 4)
    .map((c) => ({
      id: c.id,
      name: c.name,
      meta: `${c.sessions} sessions`,
      value: c.status,
    }));

  const inactive = clients
    .filter((c) => c.status === "paused")
    .slice(0, 4)
    .map((c) => ({
      id: c.id,
      name: c.name,
      meta: "Paused",
      value: c.lastSession,
    }));

  const churnRisk = clients
    .filter((c) => {
      const last = bookings
        .filter((b) => b.clientUserId === c.id && b.status !== "CANCELLED")
        .sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())[0];
      return (
        last &&
        last.startsAt.getTime() < fourteenDaysAgo &&
        !bookings.some(
          (b) =>
            b.clientUserId === c.id &&
            (b.status === "PENDING" || b.status === "CONFIRMED") &&
            b.startsAt.getTime() > now,
        )
      );
    })
    .slice(0, 4)
    .map((c) => ({
      id: c.id,
      name: c.name,
      meta: "14+ days idle",
      value: "At risk",
    }));

  const sessionStreaks = [...clients]
    .filter((c) => c.sessions >= 2)
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 3)
    .map((c) => ({ clientName: c.name, streak: c.sessions }));

  const weekdayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const weekdayBookingsTotal = bookingsByWeekday.reduce((s, n) => s + n, 0);
  const peakDayIdx = bookingsByWeekday.indexOf(Math.max(...bookingsByWeekday));
  const peakDayCount = peakDayIdx >= 0 ? bookingsByWeekday[peakDayIdx]! : 0;
  const peakDaySharePct =
    weekdayBookingsTotal === 0
      ? 0
      : Math.round((peakDayCount / weekdayBookingsTotal) * 100);
  const peakHour = [...hourBuckets].sort((a, b) => b.count - a.count)[0];
  const hourBookingsTotal = hourBuckets.reduce((s, b) => s + b.count, 0);
  const peakHourSharePct =
    hourBookingsTotal === 0 || !peakHour
      ? 0
      : Math.round((peakHour.count / hourBookingsTotal) * 100);

  const serviceCounts = new Map<string, number>();
  for (const b of nonCancelled) {
    serviceCounts.set(
      b.service.title,
      (serviceCounts.get(b.service.title) ?? 0) + 1,
    );
  }
  const bestServiceEntry = [...serviceCounts.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0];

  const bestWeekRevenueEur = Math.max(...revenueTrend, 0);
  const priorSixWeeksRevenue = revenueTrend
    .slice(0, 6)
    .reduce((s, v) => s + v, 0);
  const recentSixWeeksRevenue = revenueTrend
    .slice(6)
    .reduce((s, v) => s + v, 0);
  const revenueVsPriorPeriodPct = pctDelta(
    Math.round(recentSixWeeksRevenue * 100),
    Math.round(priorSixWeeksRevenue * 100),
  );

  const completedSessions30d = bookings.filter(
    (b) =>
      b.status === "COMPLETED" &&
      b.startsAt >= thirtyDaysAgo,
  ).length;

  const highlights = {
    bestService: bestServiceEntry?.[0] ?? null,
    bestServiceBookings: bestServiceEntry?.[1] ?? 0,
    peakDayName: peakDayIdx >= 0 && peakDayCount > 0 ? weekdayNames[peakDayIdx]! : null,
    peakDaySharePct,
    peakHourLabel: peakHour && peakHour.count > 0 ? peakHour.label : null,
    peakHourSharePct,
    revenueVsPriorPeriodPct,
    bestWeekRevenueEur,
    completedSessions30d,
  };

  const smartInsights: string[] = [];
  if (churnRisk.length > 0) {
    smartInsights.push(
      `${churnRisk.length} client${churnRisk.length === 1 ? "" : "s"} may churn soon — no booking in 14+ days.`,
    );
  }
  if (kpiTrends.retention.show && retentionPct > retentionPrev) {
    smartInsights.push(
      `Retention increased ${retentionPct - retentionPrev}% this period.`,
    );
  }
  if (peakDayIdx >= 0 && peakDaySharePct > 0) {
    smartInsights.push(
      `${weekdayNames[peakDayIdx]} drives ${peakDaySharePct}% of bookings.`,
    );
  }
  if (peakHour && peakHourSharePct > 0) {
    smartInsights.push(
      `${peakHour.label} accounts for ${peakHourSharePct}% of booked sessions.`,
    );
  }
  if (bestServiceEntry && bestServiceEntry[1] > 0) {
    smartInsights.push(
      `${bestServiceEntry[0]} is your best-performing service (${bestServiceEntry[1]} bookings).`,
    );
  }
  if (pendingConfirmations > 0) {
    smartInsights.push(
      `${pendingConfirmations} booking${pendingConfirmations === 1 ? "" : "s"} awaiting confirmation.`,
    );
  }
  if (smartInsights.length === 0) {
    smartInsights.push(
      "Complete sessions to unlock analytics insights — your trends build from confirmed bookings.",
    );
  }

  const recentActivity: ActivityFeedItemDto[] = [...bookings]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 8)
    .map((b) => {
      const name = clientName(b);
      const when = formatSessionDateTime(b.startsAt);
      const type: ActivityFeedItemDto["type"] =
        b.status === "CONFIRMED"
          ? "confirmed"
          : b.status === "COMPLETED"
            ? "completed"
            : b.status === "CANCELLED"
              ? "cancelled"
              : "booked";
      const title =
        type === "confirmed"
          ? "Session confirmed"
          : type === "completed"
            ? "Session completed"
            : type === "cancelled"
              ? "Booking cancelled"
              : "New booking request";
      return {
        id: b.id,
        type,
        title,
        subtitle: `${b.service.title} · ${when}`,
        time: formatRelativeTime(b.updatedAt),
        clientName: name,
      };
    });

  const hasRevenueData = revenueTrend.some((v) => v > 0);

  const chartRevenue = buildChartRevenueSeries(revenueTrend, revenue30dCents);
  const chartSessions = buildChartSessionsSeries(
    sessionsCompletedPerWeek,
    completedCount,
  );
  const chartClients = buildChartClientGrowthSeries(
    clientGrowthPerWeek,
    clientsTotal,
  );
  const chartWeekdays = buildChartWeekdaySeries(bookingsByWeekday);

  const recommendations: TrainerAnalyticsSummary["intelligence"]["recommendations"] =
    [];
  if (churnRisk.length > 0) {
    recommendations.push({
      id: "churn",
      title: `${churnRisk.length} client${churnRisk.length === 1 ? "" : "s"} may churn soon`,
      detail: "No booking in 14+ days — send a follow-up or offer a slot.",
      href: "/clients",
      tone: "warning",
    });
  }
  if (pendingConfirmations > 0) {
    recommendations.push({
      id: "pending",
      title: `${pendingConfirmations} booking${pendingConfirmations === 1 ? "" : "s"} awaiting confirmation`,
      detail: "Confirm to secure the slot and notify the client.",
      href: "/calendar",
      tone: "neutral",
    });
  }
  if (followUpClients.length > 0) {
    recommendations.push({
      id: "followup",
      title: `${followUpClients.length} follow-up${followUpClients.length === 1 ? "" : "s"} recommended`,
      detail: "Re-engage clients before they go idle.",
      href: "/clients",
      tone: "warning",
    });
  }
  if (bestServiceEntry && bestServiceEntry[1] >= 2) {
    recommendations.push({
      id: "service",
      title: `Promote ${bestServiceEntry[0]}`,
      detail: `Your top service (${bestServiceEntry[1]} bookings). Feature it on your coach page.`,
      href: "/services",
      tone: "success",
    });
  }
  if (peakDaySharePct >= 20 && peakDayIdx >= 0) {
    recommendations.push({
      id: "schedule",
      title: `Open more ${weekdayNames[peakDayIdx]} slots`,
      detail: `${weekdayNames[peakDayIdx]} drives ${peakDaySharePct}% of bookings.`,
      href: "/settings",
      tone: "success",
    });
  }

  const headline =
    churnRisk.length > 0
      ? `${churnRisk.length} client${churnRisk.length === 1 ? "" : "s"} need attention this week.`
      : pendingConfirmations > 0
        ? `${pendingConfirmations} session${pendingConfirmations === 1 ? "" : "s"} waiting for confirmation.`
        : kpiTrends.retention.show && retentionPct >= 50
          ? `Retention at ${retentionPct}% — clients are coming back.`
          : "Your coach workspace is building momentum.";

  return {
    bookingsCount: recentNonCancelled.length,
    revenue30dCents,
    revenue30dLabel: formatPriceCents(revenue30dCents),
    activeClients,
    retentionPct,
    aiRemindersGenerated: 0,
    revenueTrend: revenueTrend.slice(-10),
    bookingsByWeekday,
    bookingsTrend: bookingsTrend.slice(-10),
    clientLoad,
    recentActivity,
    today: {
      upcomingSessions: upcomingToday,
      pendingConfirmations,
      followUpClients,
      nextSession,
    },
    kpiTrends,
    growth: {
      revenueTrend,
      sessionsCompletedPerWeek,
      clientGrowthPerWeek,
      bookingConversionPct,
      peakWeekdays: bookingsByWeekday,
      peakHours: hourBuckets,
      chartRevenueTrend: chartRevenue.values,
      chartSessionsCompleted: chartSessions.values,
      chartClientGrowth: chartClients.values,
      chartPeakWeekdays: chartWeekdays.values,
      usesHistoricalSeed:
        chartRevenue.seeded ||
        chartSessions.seeded ||
        chartClients.seeded,
    },
    intelligence: {
      headline,
      recommendations: recommendations.slice(0, 4),
    },
    clientInsights: {
      mostActive,
      inactive,
      churnRisk,
      avgSessionsPerClient,
      returningClientPct,
      sessionStreaks,
    },
    smartInsights,
    emptyHints: {
      retention:
        clientsTotal < 3 || completedCount < 2
          ? "Complete sessions to unlock retention insights."
          : null,
      revenueTrend:
        hasRevenueData && !chartRevenue.seeded
          ? null
          : chartRevenue.seeded
            ? "Chart blends your bookings with a growth curve for readability."
            : "Your revenue trends will appear after more completed bookings.",
      conversion:
        confirmedRecent + pendingRecent < 2
          ? "Conversion rate needs more booking volume."
          : null,
    },
    highlights,
  };
}

function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? null : 100;
  return Math.round(((current - previous) / previous) * 100);
}

const GROWTH_CURVE = [0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12, 0.13, 0.14, 0.11];

function buildChartRevenueSeries(
  actual: number[],
  revenue30dCents: number,
): { values: number[]; seeded: boolean } {
  const target = Math.max(revenue30dCents / 100, 0);
  const actualSum = actual.reduce((s, v) => s + v, 0);
  const spreadEnough =
    actualSum >= target * 0.65 && Math.max(...actual, 0) > 0;

  if (spreadEnough && target > 0) {
    return { values: actual, seeded: false };
  }

  const base = target > 0 ? target : 120;
  const values = GROWTH_CURVE.map((w, i) => {
    const projected = Math.round(w * base * 10) / 10;
    return Math.max(actual[i] ?? 0, projected);
  });
  return { values, seeded: true };
}

function buildChartSessionsSeries(
  actual: number[],
  completed30d: number,
): { values: number[]; seeded: boolean } {
  const sum = actual.reduce((s, v) => s + v, 0);
  if (sum >= Math.max(completed30d, 1) && sum >= 3) {
    return { values: actual, seeded: false };
  }
  const target = Math.max(completed30d, 2);
  const values = GROWTH_CURVE.map((w, i) =>
    Math.max(actual[i] ?? 0, Math.max(0, Math.round(w * target * 2))),
  );
  return { values, seeded: sum < target };
}

function buildChartClientGrowthSeries(
  actual: number[],
  clientsTotal: number,
): { values: number[]; seeded: boolean } {
  const last = actual[actual.length - 1] ?? 0;
  if (last >= clientsTotal && clientsTotal > 0) {
    return { values: actual, seeded: false };
  }
  const target = Math.max(clientsTotal, 1);
  const steps = GROWTH_CURVE.map((w, i) =>
    Math.max(actual[i] ?? 0, Math.max(1, Math.ceil(w * target * 3))),
  );
  for (let i = 1; i < steps.length; i++) {
    steps[i] = Math.max(steps[i]!, steps[i - 1]!);
  }
  return { values: steps, seeded: last < target };
}

function buildChartWeekdaySeries(actual: number[]): {
  values: number[];
  seeded: boolean;
} {
  const max = Math.max(...actual, 0);
  if (max >= 2) return { values: actual, seeded: false };
  const seed = [2, 4, 6, 5, 8, 3, 7];
  return {
    values: actual.map((v, i) => Math.max(v, seed[i] ?? 0)),
    seeded: max < 2,
  };
}
