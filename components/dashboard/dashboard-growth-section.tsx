"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Sparkles, TrendingUp, Users } from "lucide-react";
import { DashboardChartSkeleton } from "@/components/dashboard/dashboard-motion";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PeakHoursChart,
  SessionsCompletedChart,
  WeekdayBookingsChart,
} from "@/components/visual/fitness-charts";
import { InteractiveAreaChart } from "@/components/visual/interactive-area-chart";
import { useTrainerAnalytics } from "@/hooks/use-trainer-workspace";
import { dashCard } from "@/lib/dashboard-surfaces";
import { dashChartLabel, dashMuted } from "@/lib/dashboard-typography";
import { cn } from "@/lib/utils";

function PatternInsight({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof CalendarDays;
  accent: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl px-4 py-3 ring-1 ring-inset",
        accent,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0 opacity-80" aria-hidden />
      <div className="min-w-0">
      <p className={dashChartLabel}>{label}</p>
        <p className="mt-0.5 text-sm font-semibold leading-snug text-foreground">{value}</p>
      </div>
    </div>
  );
}

export const DashboardGrowthSection = memo(function DashboardGrowthSection() {
  const { analytics: a, loading } = useTrainerAnalytics();
  const growth = a?.growth;
  const h = a?.highlights;

  const revenueSeries = growth?.chartRevenueTrend ?? growth?.revenueTrend ?? [];
  const sessionsSeries = growth?.chartSessionsCompleted ?? growth?.sessionsCompletedPerWeek ?? [];
  const weekdaySeries = growth?.chartPeakWeekdays ?? growth?.peakWeekdays ?? [];

  const hasRevenueChart = revenueSeries.some((v) => v > 0) || (a?.revenue30dCents ?? 0) > 0;
  const hasSessionsChart = sessionsSeries.some((v) => v > 0);

  const comparisonLabel = useMemo(() => {
    if (h?.revenueVsPriorPeriodPct == null) return null;
    const sign = h.revenueVsPriorPeriodPct >= 0 ? "+" : "";
    return `${sign}${h.revenueVsPriorPeriodPct}% vs prior 6 weeks`;
  }, [h]);

  const completedTotal = useMemo(
    () => (growth?.sessionsCompletedPerWeek ?? []).reduce((s, n) => s + n, 0),
    [growth],
  );

  const peakDayLabel =
    h?.peakDayName && h.peakDaySharePct > 0
      ? `${h.peakDayName} · ${h.peakDaySharePct}% of bookings`
      : "Patterns appear as you get more bookings";

  const peakHourLabel =
    h?.peakHourLabel && h.peakHourSharePct > 0
      ? `${h.peakHourLabel} · ${h.peakHourSharePct}% of sessions`
      : "Time-of-day data builds from your calendar";

  const chartHint = growth?.usesHistoricalSeed
    ? (a?.emptyHints.revenueTrend ?? "Historical curve blended with your workspace data.")
    : null;

  return (
    <DashboardSection
      title="Revenue & growth"
      description="Weekly revenue and booking patterns from your workspace."
      priority="primary"
    >
      {loading && !a ? (
        <div className="grid gap-4 lg:grid-cols-12">
          <DashboardChartSkeleton tall />
          <DashboardChartSkeleton />
          <DashboardChartSkeleton />
        </div>
      ) : (
        <div className="grid min-w-0 gap-4 lg:grid-cols-12">
          <Card className={cn("border-0", dashCard.analyticsHero, "lg:col-span-8")}>
            <CardHeader className="space-y-0.5 p-4 pb-0 sm:p-5 sm:pb-0">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg font-bold tracking-tight">Revenue trend</CardTitle>
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                  <Sparkles className="size-3" aria-hidden />
                  AI insights
                </span>
              </div>
              <CardDescription className={dashMuted}>
                {hasRevenueChart
                  ? chartHint ?? "12 weeks · hover for tooltip"
                  : (a?.emptyHints.revenueTrend ??
                    "Analytics will appear as your client activity grows.")}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-2 sm:px-5 sm:pb-5">
              {hasRevenueChart ? (
                <InteractiveAreaChart
                  values={revenueSeries}
                  fillGradientId="dash-interactive-rev"
                  comparisonLabel={comparisonLabel}
                  heightClass="h-[11.5rem] sm:h-[12.5rem]"
                />
              ) : (
                <div className="flex h-[11.25rem] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-muted/15 px-4 text-center">
                  <p className="text-sm font-semibold text-foreground">
                    Revenue chart unlocks with completed sessions
                  </p>
                  <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                    <Link href="/calendar">View bookings</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
            <Card className={cn("border-0", dashCard.statPill)}>
              <CardContent className="space-y-1 p-4 sm:p-5">
                <p className="text-sm font-medium text-muted-foreground/90">Conversion (30d)</p>
                <p className="text-2xl font-bold tabular-nums">
                  {growth?.bookingConversionPct ?? 0}%
                </p>
                <p className="text-sm leading-snug text-muted-foreground">
                  {a?.emptyHints.conversion ?? "Confirmed vs pending bookings"}
                </p>
              </CardContent>
            </Card>
            <Card className={cn("border-0", dashCard.statPillAlt)}>
              <CardContent className="space-y-1 p-4 sm:p-5">
                <p className="text-sm font-medium text-muted-foreground/90">Completed (30d)</p>
                <p className="text-2xl font-bold tabular-nums">
                  {h?.completedSessions30d ?? 0}
                </p>
                <p className="text-sm leading-snug text-muted-foreground">
                  {h?.bestService ? `Top service: ${h.bestService}` : `${completedTotal} in 12 wks`}
                </p>
              </CardContent>
            </Card>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4 }}
            className={cn("lg:col-span-6", dashCard.chartInset)}
          >
            <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="space-y-0.5 p-4 pb-0 sm:p-5 sm:pb-0">
              <CardTitle className="text-base font-bold tracking-tight">
                Sessions completed
              </CardTitle>
              <CardDescription className={dashMuted}>
                Weekly · last 12 weeks
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-4 pt-1 sm:px-4 sm:pb-5">
              {hasSessionsChart ? (
                <SessionsCompletedChart values={sessionsSeries} />
              ) : (
                <div className="flex min-h-[11.25rem] items-center justify-center rounded-lg border border-dashed border-border/50 bg-background/60 px-4">
                  <p className="text-center text-sm text-muted-foreground">
                    Complete sessions to populate this chart.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.4 }}
            className={cn("lg:col-span-6", dashCard.chartInset)}
          >
            <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="space-y-0.5 p-4 pb-0 sm:p-5 sm:pb-0">
              <CardTitle className="text-base font-bold tracking-tight">
                Bookings by weekday
              </CardTitle>
              <CardDescription className={dashMuted}>
                Weekly average · Mon–Sun
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-4 pt-1 sm:px-4 sm:pb-5">
              <WeekdayBookingsChart values={weekdaySeries} />
            </CardContent>
          </Card>
          </motion.div>

          <Card className={cn("border-0", dashCard.chartInset, "lg:col-span-5")}>
            <CardHeader className="p-4 pb-0 sm:p-5 sm:pb-0">
              <CardTitle className="text-base font-bold tracking-tight">Peak hours</CardTitle>
              <CardDescription className={dashMuted}>
                When clients book most often
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <PeakHoursChart buckets={growth?.peakHours ?? []} />
            </CardContent>
          </Card>

          <Card className={cn("border-0", dashCard.patternRail, "lg:col-span-7")}>
            <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-2">
              <CardTitle className="text-base font-bold tracking-tight">Booking patterns</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-4 pt-0 sm:grid-cols-2 sm:p-5 sm:pt-0">
              <PatternInsight
                label="Busiest day"
                value={peakDayLabel}
                icon={CalendarDays}
                accent="bg-orange-500/[0.07] ring-orange-500/20 text-orange-700"
              />
              <PatternInsight
                label="Peak hours"
                value={peakHourLabel}
                icon={Clock}
                accent="bg-teal-500/[0.07] ring-teal-500/20 text-teal-700"
              />
              <PatternInsight
                label="Sessions completed"
                value={`${completedTotal} sessions over the last 12 weeks`}
                icon={TrendingUp}
                accent="bg-emerald-500/[0.06] ring-emerald-500/20 text-emerald-700"
              />
              <PatternInsight
                label="Client growth"
                value={`${growth?.clientGrowthPerWeek.at(-1) ?? 0} unique clients to date`}
                icon={Users}
                accent="bg-violet-500/[0.06] ring-violet-500/20 text-violet-700"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardSection>
  );
});
