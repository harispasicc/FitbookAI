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
import { cn } from "@/lib/utils";
function avatarIndexFromId(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash + id.charCodeAt(i)) % trainerAvatarUrls.length;
    }
    return hash;
}

function toneRing(tone: ClientNotification["tone"]) {
    switch (tone) {
        case "success":
            return "border-emerald-500/25 bg-emerald-500/[0.06]";
        case "warning":
            return "border-amber-700/30 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-950/90";
        case "info":
            return "border-sky-500/25 bg-sky-500/[0.05]";
        default:
            return "border-border bg-muted/30";
    }
}
export function ClientHomeView() {
    const { user } = useAuth();
    const { rows: myBookings } = useBookings();
    const [goals, setGoals] = useState<ClientGoalsState>(defaultClientGoals);
    const [coach, setCoach] = useState<ClientCoachDto | null>(null);
    const [notifications, setNotifications] = useState<ClientNotification[]>([]);

    const avatarSrc = coach
        ? (trainerAvatarUrls[avatarIndexFromId(coach.id) % trainerAvatarUrls.length] ??
          trainerAvatarUrls[0])
        : null;

    useEffect(() => {
        if (!user || user.role !== "client")
            return;

        let cancelled = false;

        async function load() {
            try {
                const [goalsDto, coachDto, notifs] = await Promise.all([
                    apiGetClientGoals(),
                    apiGetClientCoach(),
                    apiGetClientNotifications(),
                ]);
                if (cancelled)
                    return;
                setGoals(goalsDtoToState(goalsDto));
                setCoach(coachDto);
                setNotifications(notifs);
            }
            catch {
            }
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
    const [upcomingCutoffMs] = useState(() => Date.now() - 36e5);
    const upcoming = useMemo(() => {
        return [...myBookings]
            .filter((b) => b.status !== "cancelled" && b.slotIso && new Date(b.slotIso).getTime() >= upcomingCutoffMs)
            .sort((a, b) => (a.slotIso ?? "").localeCompare(b.slotIso ?? ""))
            .slice(0, 3);
    }, [myBookings, upcomingCutoffMs]);
    const firstName = user?.name?.split(/\s+/)[0] ?? "there";
    const activeGoalLabel = goalLabels[goals.active];
    const activeGoalPct = goals.pct[goals.active];
    return (<div className="flex min-w-0 flex-col gap-8 lg:gap-10">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 space-y-2">
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back, {firstName}</h1>
        <p className="text-pretty text-sm text-muted-foreground sm:text-base">
          Sessions, goals, and coach updates in one place. Stay on track between training days.
        </p>
      </motion.div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
            { label: "Active goal", value: activeGoalLabel, sub: `${activeGoalPct}% complete`, icon: Target },
            { label: "Upcoming sessions", value: String(upcoming.length), sub: "Next 7 days window", icon: CalendarPlus },
            {
              label: "Completed sessions",
              value: String(myBookings.filter((b) => b.status === "completed").length),
              sub: "All time",
              icon: Flame,
            },
            {
              label: "Linked coach",
              value: coach?.fullName ?? "None yet",
              sub: coach?.specialty ?? "Find a coach to get started",
              icon: UserRound,
            },
        ].map((s, i) => (<motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} whileHover={{ y: -2 }}>
            <Card className="h-full rounded-2xl border border-border/80 bg-card shadow-sm">
              <CardContent className="flex items-start gap-3 p-4 sm:p-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 text-primary">
                  <s.icon className="size-5" aria-hidden/>
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
                  <p className="truncate text-lg font-semibold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>))}
      </div>

      <ClientAiAssistantPanelLazy />

      <div className="grid min-w-0 gap-6 lg:grid-cols-3 lg:gap-8">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {coach && avatarSrc ? (<Card className="overflow-hidden rounded-2xl border border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">My coach</CardTitle>
                <CardDescription>Your assigned coach and next touchpoints.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <Image src={avatarSrc} alt="" width={96} height={96} className="size-24 shrink-0 rounded-2xl border border-border object-cover" sizes="96px"/>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <p className="text-lg font-semibold text-foreground">{coach.fullName ?? "Coach"}</p>
                      <p className="text-sm text-muted-foreground">{coach.specialty ?? "Coaching"}</p>
                      {coach.bio ? (<p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{coach.bio}</p>) : null}
                    </div>
                    <Button size="sm" className="gap-2 rounded-xl" asChild>
                      <Link href={`/coaches/${coach.id}`}>
                        <CalendarPlus className="size-4" aria-hidden />
                        Book a session
                        <ArrowRight className="size-4" aria-hidden />
                      </Link>
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Next session</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
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
                    <p className="mt-0.5 text-xs text-muted-foreground">{upcoming[0]?.service ?? "Pick a service to lock time"}</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Current goal</p>
                    <p className="mt-1 text-sm font-medium text-foreground">{activeGoalLabel}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${activeGoalPct}%` }}/>
                    </div>
                  </div>
                  <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-3 sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your plan</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {coach.activeServicesCount} active service
                      {coach.activeServicesCount === 1 ? "" : "s"} with {coach.fullName ?? "your coach"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Book and pay per session. No subscription billing in this app yet.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>) : (<Card className="rounded-2xl border border-dashed border-border bg-muted/20">
              <CardContent className="space-y-3 p-6 text-center sm:p-8">
                <p className="text-sm font-medium text-foreground">Connect with a coach</p>
                <p className="text-sm text-muted-foreground">
                  Select a coach from the directory to link them here.
                </p>
                <Button asChild>
                  <Link href="/coaches">Find coaches</Link>
                </Button>
              </CardContent>
            </Card>)}

          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            <Card className="rounded-2xl border border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Goal summary</CardTitle>
                <CardDescription>Synced from your Progress tab.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  You&apos;re focused on <span className="font-medium text-foreground">{activeGoalLabel}</span> at{" "}
                  <span className="font-medium tabular-nums text-foreground">{activeGoalPct}%</span> completion.
                </p>
                <Button variant="outline" size="sm" className="rounded-xl" asChild>
                  <Link href="/me/progress">Edit goals</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border border-border/80 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Upcoming sessions</CardTitle>
                <CardDescription>Your upcoming FitBook sessions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {upcoming.length === 0 ? (
                  <EmptyState
                    compact
                    icon={CalendarClock}
                    title="No upcoming sessions"
                    description="Book a session from a coach profile to see it here."
                  >
                    <Button asChild variant="secondary" size="sm" className="min-h-9">
                      <Link href="/coaches">Find coaches</Link>
                    </Button>
                  </EmptyState>
                ) : (
                  upcoming.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/15 px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 truncate font-medium text-foreground">{b.service}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
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
                <Button variant="link" className="h-auto px-0 text-primary" asChild>
                  <Link href="/me/sessions">View all sessions</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent activity</CardTitle>
              <CardDescription>Workouts and platform events (sample).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start justify-between gap-3 rounded-xl border border-border/60 px-3 py-2">
                <span className="text-muted-foreground">Lower strength completed</span>
                <span className="shrink-0 text-xs text-muted-foreground">May 9</span>
              </div>
              <div className="flex items-start justify-between gap-3 rounded-xl border border-border/60 px-3 py-2">
                <span className="text-muted-foreground">Coach updated your conditioning block</span>
                <span className="shrink-0 text-xs text-muted-foreground">May 8</span>
              </div>
              <div className="flex items-start justify-between gap-3 rounded-xl border border-border/60 px-3 py-2">
                <span className="text-muted-foreground">Progress photo uploaded</span>
                <span className="shrink-0 text-xs text-muted-foreground">May 5</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="min-w-0 space-y-6">
          <Card className="rounded-2xl border border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="size-4 text-primary" aria-hidden/>
                Notifications
              </CardTitle>
              <CardDescription>Reminders and coach updates.</CardDescription>
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
                            prev.map((x) =>
                              x.id === n.id ? { ...x, read: true } : x,
                            ),
                          );
                          notifyClientPortalUpdated();
                        });
                      }
                    }}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2.5 text-left transition-opacity",
                      toneRing(n.tone),
                      n.read && "opacity-60",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {n.timeLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{n.body}</p>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/80 bg-gradient-to-br from-card to-primary/[0.04] shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" aria-hidden/>
                Progress snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Momentum is strongest on <span className="font-medium text-foreground">conditioning</span> days. Keep
                two easy aerobic sessions between heavy lower days.
              </p>
              <Button variant="secondary" size="sm" className="w-full rounded-xl" asChild>
                <Link href="/me/progress">Open progress</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <Link href="/me/sessions" className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
          <CalendarPlus className="size-8 text-primary" aria-hidden/>
          <h3 className="mt-3 font-semibold text-foreground">Sessions</h3>
          <p className="mt-1 text-sm text-muted-foreground">Table view, filters, and synced bookings from FitBook.</p>
          <span className="mt-3 inline-flex items-center text-sm font-medium text-primary group-hover:underline">
            Open sessions <ArrowRight className="ml-1 size-4"/>
          </span>
        </Link>
        <Link href="/me/progress" className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
          <Sparkles className="size-8 text-primary" aria-hidden/>
          <h3 className="mt-3 font-semibold text-foreground">Progress</h3>
          <p className="mt-1 text-sm text-muted-foreground">Goals, workout log, and editable completion cards.</p>
          <span className="mt-3 inline-flex items-center text-sm font-medium text-primary group-hover:underline">
            View progress <ArrowRight className="ml-1 size-4"/>
          </span>
        </Link>
      </div>
    </div>);
}
