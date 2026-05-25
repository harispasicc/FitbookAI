"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  CalendarClock,
  CalendarPlus,
  Flame,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import { AnimatedCounter } from "@/components/dashboard/dashboard-motion";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/contexts/auth-context";
import { useBookings } from "@/hooks/use-bookings";
import {
  apiGetClientCoach,
  apiGetClientGoals,
  apiGetClientNotifications,
  apiMarkNotificationRead,
  goalsDtoToState,
  type ClientCoachDto,
} from "@/lib/client-portal-api";
import { clientCard } from "@/lib/client-surfaces";
import { trainerAvatarUrls } from "@/lib/media-urls";
import {
  CLIENT_PORTAL_UPDATE_EVENT,
  notifyClientPortalUpdated,
} from "@/lib/demo-data-events";
import {
  defaultClientGoals,
  goalLabels,
  type ClientGoalsState,
} from "@/lib/client-goals-storage";
import type { ClientNotification } from "@/lib/client-mocks";
import { ClientAiAssistantPanelLazy } from "@/components/client/client-ai-assistant-panel-lazy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { dashMuted, dashMutedSm } from "@/lib/dashboard-typography";
import { deferEffect } from "@/lib/defer-effect";
import { clearJustSignedUp, isJustSignedUp } from "@/lib/first-visit-welcome";
import { cn } from "@/lib/utils";

function avatarIndexFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i)) % trainerAvatarUrls.length;
  }
  return hash;
}

function toneSurface(tone: ClientNotification["tone"]) {
  return clientCard.notify(
    tone === "success"
      ? "success"
      : tone === "warning"
        ? "warning"
        : tone === "info"
          ? "info"
          : "neutral",
  );
}

export function ClientHomeView() {
  const { user } = useAuth();
  const { rows: myBookings } = useBookings();
  const [goals, setGoals] = useState<ClientGoalsState>(defaultClientGoals);
  const [coach, setCoach] = useState<ClientCoachDto | null>(null);
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [firstVisit, setFirstVisit] = useState(false);

  const avatarSrc = coach
    ? (trainerAvatarUrls[avatarIndexFromId(coach.id) % trainerAvatarUrls.length] ??
      trainerAvatarUrls[0])
    : null;

  useEffect(() => {
    if (!user || user.role !== "client") return;

    let cancelled = false;

    async function load() {
      try {
        const [goalsDto, coachDto, notifs] = await Promise.all([
          apiGetClientGoals(),
          apiGetClientCoach(),
          apiGetClientNotifications(),
        ]);
        if (cancelled) return;
        setGoals(goalsDtoToState(goalsDto));
        setCoach(coachDto);
        setNotifications(notifs);
      } catch {}
    }

    void load();

    function onPortalUpdate() {
      void load();
    }
    window.addEventListener(CLIENT_PORTAL_UPDATE_EVENT, onPortalUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener(CLIENT_PORTAL_UPDATE_EVENT, onPortalUpdate);
    };
  }, [user, user?.selectedTrainerId]);

  useEffect(() => {
    if (!user?.id) return;
    deferEffect(() => {
      if (isJustSignedUp(user.id)) {
        setFirstVisit(true);
        clearJustSignedUp(user.id);
      }
    });
  }, [user?.id]);

  const [upcomingCutoffMs] = useState(() => Date.now() - 36e5);
  const upcoming = useMemo(() => {
    return [...myBookings]
      .filter(
        (b) =>
          b.status !== "cancelled" &&
          b.slotIso &&
          new Date(b.slotIso).getTime() >= upcomingCutoffMs,
      )
      .sort((a, b) => (a.slotIso ?? "").localeCompare(b.slotIso ?? ""))
      .slice(0, 3);
  }, [myBookings, upcomingCutoffMs]);

  const completedCount = myBookings.filter((b) => b.status === "completed").length;
  const firstName = user?.name?.split(/\s+/)[0] ?? "there";
  const activeGoalLabel = goalLabels[goals.active];
  const activeGoalPct = goals.pct[goals.active];

  const stats = [
    {
      label: "Active goal",
      value: activeGoalLabel,
      sub: `${activeGoalPct}% complete`,
      icon: Target,
      numeric: activeGoalPct,
    },
    {
      label: "Upcoming sessions",
      value: String(upcoming.length),
      sub: "Next 7 days window",
      icon: CalendarPlus,
      numeric: upcoming.length,
    },
    {
      label: "Completed sessions",
      value: String(completedCount),
      sub: "All time",
      icon: Flame,
      numeric: completedCount,
    },
    {
      label: "Linked coach",
      value: coach?.fullName ?? "None yet",
      sub: coach?.specialty ?? "Find a coach to get started",
      icon: UserRound,
      numeric: null as number | null,
    },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-8 lg:gap-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-w-0 space-y-3"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500/12 to-teal-500/12 px-3 py-1 text-xs font-bold tracking-wide text-teal-800 ring-1 ring-teal-500/15">
          <Sparkles className="size-3.5 text-violet-600" aria-hidden />
          FitBook Client
        </span>
        <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {firstVisit ? `Welcome, ${firstName}` : `Welcome back, ${firstName}`}
        </h1>
        <p className={cn("text-pretty max-w-2xl", dashMuted)}>
          Sessions, goals, and coach updates in one place. Stay on track between training days.
        </p>
      </motion.div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <Card className={clientCard.stat}>
              <CardContent className="flex items-start gap-3.5 p-4 sm:p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/12 text-teal-700 shadow-sm">
                  <s.icon className="size-5 stroke-[1.75]" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={dashMutedSm}>{s.label}</p>
                  <p className="truncate text-lg font-bold text-foreground sm:text-xl">
                    {s.label === "Upcoming sessions" || s.label === "Completed sessions" ? (
                      <AnimatedCounter value={s.numeric ?? 0} />
                    ) : (
                      s.value
                    )}
                  </p>
                  <p className={cn("mt-0.5", dashMutedSm)}>{s.sub}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <ClientAiAssistantPanelLazy />

      <div className="grid min-w-0 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {coach && avatarSrc ? (
            <Card className={clientCard.coachHero}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">My coach</CardTitle>
                <CardDescription className={dashMutedSm}>
                  Your assigned coach and next touchpoints.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <Image
                    src={avatarSrc}
                    alt=""
                    width={96}
                    height={96}
                    className="size-24 shrink-0 rounded-2xl object-cover shadow-md ring-2 ring-teal-500/15"
                    sizes="96px"
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        {coach.fullName ?? "Coach"}
                      </p>
                      <p className={dashMutedSm}>{coach.specialty ?? "Coaching"}</p>
                      {coach.bio ? (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground/85">
                          {coach.bio}
                        </p>
                      ) : null}
                    </div>
                    <Button size="sm" className="gap-2 rounded-xl shadow-sm" asChild>
                      <Link href={`/coaches/${coach.id}`}>
                        <CalendarPlus className="size-4" aria-hidden />
                        Book a session
                        <ArrowRight className="size-4" aria-hidden />
                      </Link>
                    </Button>
                  </div>
                </div>
                <Separator className="opacity-50" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className={cn(clientCard.listItem, "p-3.5")}>
                    <p className={dashMutedSm}>Next session</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {upcoming[0]?.slotIso
                        ? new Date(upcoming[0].slotIso).toLocaleString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : "Book a slot from your coach’s profile"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground/80">
                      {upcoming[0]?.service ?? "Pick a service to lock time"}
                    </p>
                  </div>
                  <div className={cn(clientCard.listItem, "p-3.5")}>
                    <p className={dashMutedSm}>Current goal</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {activeGoalLabel}
                    </p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted/80">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-violet-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${activeGoalPct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  <div
                    className={cn(
                      "rounded-xl border-0 bg-gradient-to-br from-teal-500/[0.08] to-violet-500/[0.06] p-3.5 shadow-sm sm:col-span-2",
                    )}
                  >
                    <p className={dashMutedSm}>Your plan</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {coach.activeServicesCount} active service
                      {coach.activeServicesCount === 1 ? "" : "s"} with{" "}
                      {coach.fullName ?? "your coach"}
                    </p>
                    <p className="text-xs text-muted-foreground/80">
                      Book and pay per session. No subscription billing in this app yet.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card
              className={cn(
                "rounded-2xl border-0 border-dashed bg-gradient-to-br from-muted/40 to-teal-500/[0.04] shadow-sm",
              )}
            >
              <CardContent className="space-y-3 p-6 text-center sm:p-8">
                <p className="text-sm font-semibold text-foreground">Connect with a coach</p>
                <p className={dashMutedSm}>
                  Select a coach from the directory to link them here.
                </p>
                <Button asChild className="rounded-xl shadow-sm">
                  <Link href="/coaches">Find coaches</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            <Card className={clientCard.panel}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Goal summary</CardTitle>
                <CardDescription className={dashMutedSm}>
                  Synced from your Progress tab.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground/85">
                  You&apos;re focused on{" "}
                  <span className="font-semibold text-foreground">{activeGoalLabel}</span> at{" "}
                  <span className="font-semibold tabular-nums text-foreground">
                    {activeGoalPct}%
                  </span>{" "}
                  completion.
                </p>
                <Button variant="outline" size="sm" className="rounded-xl border-0 bg-muted/50" asChild>
                  <Link href="/me/progress">Edit goals</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className={clientCard.panel}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold">Upcoming sessions</CardTitle>
                <CardDescription className={dashMutedSm}>
                  Your upcoming FitBook sessions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcoming.length === 0 ? (
                  <EmptyState
                    compact
                    icon={CalendarClock}
                    title="No upcoming sessions"
                    description="Book a session from a coach profile to see it here."
                  >
                    <Button asChild variant="secondary" size="sm" className="min-h-9 rounded-xl">
                      <Link href="/coaches">Find coaches</Link>
                    </Button>
                  </EmptyState>
                ) : (
                  upcoming.map((b) => (
                    <div
                      key={b.id}
                      className={cn(
                        clientCard.listItem,
                        "flex items-center justify-between gap-2 text-sm",
                      )}
                    >
                      <span className="min-w-0 truncate font-medium text-foreground">
                        {b.service}
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground/80">
                        {b.slotIso
                          ? new Date(b.slotIso).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : b.date}
                      </span>
                    </div>
                  ))
                )}
                <Button variant="link" className="h-auto px-0 text-teal-700" asChild>
                  <Link href="/me/sessions">View all sessions</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className={clientCard.panelTint}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Recent activity</CardTitle>
              <CardDescription className={dashMutedSm}>
                Workouts and platform events (sample).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                ["Lower strength completed", "May 9"],
                ["Coach updated your conditioning block", "May 8"],
                ["Progress photo uploaded", "May 5"],
              ].map(([label, date]) => (
                <div
                  key={label}
                  className={cn(
                    clientCard.listItem,
                    "flex items-start justify-between gap-3",
                  )}
                >
                  <span className="text-muted-foreground/85">{label}</span>
                  <span className="shrink-0 text-xs text-muted-foreground/75">{date}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <aside className="min-w-0 space-y-6">
          <Card className={clientCard.panel}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Bell className="size-4 text-teal-600" aria-hidden />
                Notifications
              </CardTitle>
              <CardDescription className={dashMutedSm}>
                Reminders and coach updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {notifications.length === 0 ? (
                <EmptyState
                  compact
                  icon={Bell}
                  title="No notifications yet"
                  description="Reminders and coach updates will appear here when you have activity."
                />
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      if (!n.read) {
                        void apiMarkNotificationRead(n.id).then(() => {
                          setNotifications((prev) =>
                            prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
                          );
                          notifyClientPortalUpdated();
                        });
                      }
                    }}
                    className={cn(
                      "w-full px-3 py-2.5 text-left transition-all hover:shadow-md",
                      toneSurface(n.tone),
                      n.read && "opacity-60",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">{n.title}</p>
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-muted-foreground/75">
                        {n.timeLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground/85">
                      {n.body}
                    </p>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card className={clientCard.panelAccent}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Sparkles className="size-4 text-violet-600" aria-hidden />
                Progress snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground/85">
              <p>
                Momentum is strongest on{" "}
                <span className="font-semibold text-foreground">conditioning</span> days. Keep two
                easy aerobic sessions between heavy lower days.
              </p>
              <Button variant="secondary" size="sm" className="w-full rounded-xl" asChild>
                <Link href="/me/progress">Open progress</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <Link
          href="/me/sessions"
          className={cn(
            clientCard.panel,
            "group flex flex-col p-5 no-underline hover:shadow-lg",
          )}
        >
          <CalendarPlus className="size-8 text-teal-600" aria-hidden />
          <h3 className="mt-3 font-bold text-foreground">Sessions</h3>
          <p className={cn("mt-1", dashMutedSm)}>
            Table view, filters, and synced bookings from FitBook.
          </p>
          <span className="mt-3 inline-flex items-center text-sm font-semibold text-teal-700 group-hover:underline">
            Open sessions <ArrowRight className="ml-1 size-4" />
          </span>
        </Link>
        <Link
          href="/me/progress"
          className={cn(
            clientCard.panelAccent,
            "group flex flex-col p-5 no-underline hover:shadow-lg",
          )}
        >
          <Sparkles className="size-8 text-violet-600" aria-hidden />
          <h3 className="mt-3 font-bold text-foreground">Progress</h3>
          <p className={cn("mt-1", dashMutedSm)}>
            Goals, workout log, and editable completion cards.
          </p>
          <span className="mt-3 inline-flex items-center text-sm font-semibold text-violet-700 group-hover:underline">
            View progress <ArrowRight className="ml-1 size-4" />
          </span>
        </Link>
      </div>
    </div>
  );
}
