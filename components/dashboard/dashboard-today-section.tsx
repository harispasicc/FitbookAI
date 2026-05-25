"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock,
  Inbox,
  MessageSquare,
  Users,
} from "lucide-react";
import { BookingRowActions } from "@/components/dashboard/booking-row-actions";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { BusyDots } from "@/components/ui/busy-dots";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrainerAvatar } from "@/components/visual/trainer-avatar";
import { useBookings } from "@/hooks/use-bookings";
import { useTrainerAnalytics } from "@/hooks/use-trainer-workspace";
import { bookingStatusStyles } from "@/lib/booking-status-styles";
import {
  apiListTrainerNotifications,
  type TrainerNotificationDto,
} from "@/lib/trainer-portal-api";
import {
  AnimatedCounter,
  DashReveal,
  DashboardTodaySkeleton,
} from "@/components/dashboard/dashboard-motion";
import { dashCard } from "@/lib/dashboard-surfaces";
import { dashMuted } from "@/lib/dashboard-typography";
import { deferEffect } from "@/lib/defer-effect";
import { cn } from "@/lib/utils";

function formatCountdown(minutes: number): string {
  if (minutes < 60) return `starts in ${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h < 24) return m > 0 ? `starts in ${h}h ${m}m` : `starts in ${h}h`;
  const d = Math.floor(h / 24);
  return `starts in ${d}d`;
}

function urgencyClass(minutes: number): string {
  if (minutes <= 120) {
    return "border-0 bg-gradient-to-r from-orange-500 to-orange-600 px-2.5 py-1 text-xs font-semibold text-white shadow-md shadow-orange-500/25";
  }
  return "border border-border/60 bg-background/90 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm";
}

const statConfig = [
  {
    key: "Today",
    icon: CalendarClock,
    iconClass: "text-teal-600",
    tileHover: "hover:bg-teal-500/[0.04]",
  },
  {
    key: "Pending",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
    tileHover: "hover:bg-emerald-500/[0.04]",
    urgent: true,
  },
  {
    key: "Follow-up",
    icon: AlertCircle,
    iconClass: "text-orange-600",
    tileHover: "hover:bg-orange-500/[0.04]",
  },
  {
    key: "Unread",
    icon: Bell,
    iconClass: "text-slate-500",
    tileHover: "hover:bg-slate-500/[0.04]",
  },
] as const;

export function DashboardTodaySection() {
  const { analytics, loading: analyticsLoading } = useTrainerAnalytics();
  const { rows, loading: bookingsLoading } = useBookings();
  const [notifications, setNotifications] = useState<TrainerNotificationDto[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());

  const loadNotifications = useCallback(async () => {
    try {
      const data = await apiListTrainerNotifications();
      setNotifications(data.items);
      setReadIds(new Set(data.readIds));
    } catch {
      setNotifications([]);
      setReadIds(new Set());
    }
  }, []);

  useEffect(() => {
    deferEffect(() => {
      void loadNotifications();
    });
  }, [loadNotifications]);

  const unread = useMemo(
    () => notifications.filter((n) => !readIds.has(n.id)),
    [notifications, readIds],
  );

  const rowById = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);
  const today = analytics?.today;
  const recent = analytics?.recentActivity?.slice(0, 3) ?? [];
  const loading = analyticsLoading && !analytics;

  const statValues: Record<(typeof statConfig)[number]["key"], number> = {
    Today: today?.upcomingSessions.length ?? 0,
    Pending: today?.pendingConfirmations ?? 0,
    "Follow-up": today?.followUpClients.length ?? 0,
    Unread: unread.length,
  };

  const hasScheduleToday = (today?.upcomingSessions.length ?? 0) > 0;

  return (
    <DashboardSection
      title="Today"
      description="Sessions, confirmations, and follow-ups for your workday."
      className="[&_p]:text-muted-foreground/85"
      priority="primary"
      action={
        <Button asChild variant="outline" size="sm" className="h-8 rounded-lg text-xs">
          <Link href="/calendar">Calendar</Link>
        </Button>
      }
    >
      {loading ? (
        <DashboardTodaySkeleton />
      ) : (
        <div className="space-y-4">
          <div className="grid min-w-0 gap-4 lg:grid-cols-5">
            <DashReveal className="lg:col-span-3">
            <Card
              className={cn(
                "border-0",
                today?.nextSession ? dashCard.hero : dashCard.heroIdle,
              )}
            >
              <CardContent className="p-5 sm:p-6">
                {today?.nextSession ? (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <TrainerAvatar
                        seed={today.nextSession.clientName}
                        size="xl"
                        className="ring-[3px] ring-orange-500/20 shadow-md"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                            Next session
                          </span>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full",
                              urgencyClass(today.nextSession.minutesUntil),
                            )}
                          >
                            {formatCountdown(today.nextSession.minutesUntil)}
                          </span>
                        </div>
                        <p className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                          {today.nextSession.clientName}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {today.nextSession.service}
                        </p>
                        <p className="mt-0.5 text-sm tabular-nums text-muted-foreground">
                          {today.nextSession.timeLabel}
                        </p>
                      </div>
                    </div>
                    {rowById.get(today.nextSession.id) ? (
                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        <BookingRowActions
                          row={rowById.get(today.nextSession.id)!}
                          role="trainer"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted/40">
                        <Clock className="size-5 text-muted-foreground" aria-hidden />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          No upcoming session
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Open availability to attract bookings.
                        </p>
                      </div>
                    </div>
                    <Button asChild size="sm" className="h-8 shrink-0 text-xs">
                      <Link href="/settings">Open slots</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            </DashReveal>

            <DashReveal delay={0.05} className="lg:col-span-2">
            <Card className={cn("border-0", dashCard.statCluster)}>
              <CardContent className="p-4 pt-4 pb-4 sm:p-5 sm:pt-5 sm:pb-5">
                <div className="grid grid-cols-2 gap-3">
                  {statConfig.map(({ key, icon: Icon, iconClass, tileHover }) => {
                    const value = statValues[key];
                    const isUrgent = key === "Pending" && value > 0;
                    return (
                      <div
                        key={key}
                        className={cn(
                          "flex min-h-[5.25rem] items-center gap-3 rounded-xl border-0 px-4 py-3 shadow-sm transition-all duration-300",
                          isUrgent
                            ? "bg-orange-500/[0.1] shadow-orange-500/10"
                            : "bg-background/80 shadow-black/[0.04]",
                          tileHover,
                          "hover:-translate-y-0.5 hover:shadow-md",
                        )}
                      >
                        <Icon className={cn("size-6 shrink-0", iconClass)} aria-hidden />
                        <div className="min-w-0 flex-1">
                          <p className="text-2xl font-bold tabular-nums leading-none text-foreground">
                            <AnimatedCounter value={value} />
                          </p>
                          <p className={cn("mt-1.5", dashMuted)}>{key}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            </DashReveal>
          </div>

          <div className="grid min-w-0 gap-4 lg:grid-cols-3">
            {hasScheduleToday || bookingsLoading ? (
              <Card className="rounded-xl border border-border/80 shadow-sm lg:col-span-2">
                <CardContent className="p-4 sm:p-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Schedule today
                  </p>
                  {bookingsLoading ? (
                    <BusyDots size="sm" />
                  ) : (
                    <ul className="divide-y divide-border/60">
                      {today?.upcomingSessions.map((s) => {
                        const row = rowById.get(s.id);
                        return (
                          <li
                            key={s.id}
                            className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
                          >
                            <span className="w-14 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                              {s.timeLabel}
                            </span>
                            <TrainerAvatar seed={s.clientName} size="sm" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">{s.clientName}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {s.service}
                              </p>
                            </div>
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                                bookingStatusStyles(
                                  s.status as
                                    | "pending"
                                    | "confirmed"
                                    | "completed"
                                    | "cancelled",
                                ),
                              )}
                            >
                              {s.status}
                            </span>
                            {row ? (
                              <BookingRowActions row={row} role="trainer" />
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 py-3 lg:col-span-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">No sessions today.</span>{" "}
                  Open slots so clients can book you.
                </p>
                <Button asChild variant="outline" size="sm" className="h-8 shrink-0 text-xs">
                  <Link href="/settings">Open slots</Link>
                </Button>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Card className={cn("border-0", dashCard.panelTint)}>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-teal-600" aria-hidden />
                      <p className="text-sm font-semibold text-foreground">Follow-up</p>
                    </div>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs text-teal-700 hover:bg-teal-500/10 hover:text-teal-800"
                    >
                      <Link href="/clients">
                        {(today?.followUpClients.length ?? 0) > 0 ? (
                          <>
                            <MessageSquare className="mr-1.5 size-3.5" />
                            View clients
                          </>
                        ) : (
                          "Clear"
                        )}
                      </Link>
                    </Button>
                  </div>
                  {(today?.followUpClients.length ?? 0) === 0 ? (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      All clients recently engaged.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {(today?.followUpClients ?? []).slice(0, 3).map((c) => (
                        <li key={c.id}>
                          <Link
                            href={`/clients/${c.id}`}
                            className="block rounded-lg border border-border/60 bg-card/80 px-3 py-2.5 text-sm transition hover:bg-card"
                          >
                            <span className="font-medium text-foreground">{c.name}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {c.reason.replace("No booking in", "Not booked in")}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card className={cn("border-0", dashCard.panelTintAlt)}>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <Inbox className="size-4 text-slate-500" aria-hidden />
                    <p className="text-sm font-semibold text-foreground">Inbox & activity</p>
                  </div>
                  {unread.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">
                      No unread notifications.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {unread.slice(0, 2).map((n) => (
                        <li
                          key={n.id}
                          className="rounded-lg border border-orange-500/20 bg-orange-500/[0.05] px-3 py-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">{n.title}</p>
                            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                              {n.timeLabel}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {recent.length > 0 ? (
                    <ul className="mt-3 space-y-2 border-t border-border/60 pt-3">
                      {recent.map((a) => (
                        <li
                          key={a.id}
                          className="flex items-start gap-2.5 rounded-md px-1 py-0.5"
                        >
                          <span
                            className="mt-1.5 size-2 shrink-0 rounded-full bg-teal-500/80"
                            aria-hidden
                          />
                          <div className="min-w-0 flex-1 text-sm leading-snug">
                            <span className="font-medium text-foreground">{a.clientName}</span>
                            <span className="text-muted-foreground"> — {a.title}</span>
                          </div>
                          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                            {a.time}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </DashboardSection>
  );
}
