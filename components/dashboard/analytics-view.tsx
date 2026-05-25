"use client";

import { memo } from "react";
import { DashboardClientInsights } from "@/components/dashboard/dashboard-client-insights";
import { DashboardGrowthSection } from "@/components/dashboard/dashboard-growth-section";
import { DashboardKpiOverview } from "@/components/dashboard/dashboard-kpi-overview";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { TrainerActivityFeed } from "@/components/dashboard/trainer-activity-feed";
import { LoadingPlaceholder } from "@/components/ui/busy-dots";
import { BodyProgressCard } from "@/components/visual/body-progress-card";
import { DonutKpi, WeeklyBarsChart } from "@/components/visual/fitness-charts";
import { WorkoutVolumeCard } from "@/components/visual/workout-volume-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrainerAnalytics } from "@/hooks/use-trainer-workspace";

const AnalyticsGrowth = memo(function AnalyticsGrowth() {
  return <DashboardGrowthSection />;
});

const AnalyticsKpis = memo(function AnalyticsKpis() {
  return <DashboardKpiOverview />;
});

const AnalyticsClients = memo(function AnalyticsClients() {
  return <DashboardClientInsights />;
});

export function AnalyticsView() {
  const { analytics: a, loading, error } = useTrainerAnalytics();

  return (
    <div className="flex min-w-0 flex-col gap-5 md:gap-6">
      <header className="min-w-0 space-y-1">
        <h1 className="text-balance text-xl font-semibold tracking-tight min-[400px]:text-2xl">
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Deep dive into revenue, retention, booking patterns, and client health.
        </p>
      </header>

      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {loading && !a ? <LoadingPlaceholder minHeight="min-h-[10rem]" /> : null}

      <AnalyticsKpis />
      <AnalyticsGrowth />

      <DashboardSection
        title="Retention"
        description="Repeat engagement and training rhythm."
        dense
        priority="secondary"
      >
        <Card className="rounded-xl border border-border/80 shadow-sm">
          <CardContent className="flex flex-wrap items-center justify-center gap-6 p-4">
            {a?.emptyHints.retention ? (
              <p className="max-w-md text-center text-sm text-muted-foreground">
                {a.emptyHints.retention}
              </p>
            ) : (
              <DonutKpi pct={a?.retentionPct ?? 0} arcClass="stroke-teal-500" />
            )}
          </CardContent>
        </Card>
      </DashboardSection>

      <AnalyticsClients />

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Sessions by weekday</CardTitle>
            <CardDescription>All-time booking distribution (Mon–Sun)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 rounded-xl border border-border/60 bg-muted/15 p-2">
              <WeeklyBarsChart
                values={a?.bookingsByWeekday ?? [0, 0, 0, 0, 0, 0, 0]}
                barClassName="fill-orange-500/78"
              />
            </div>
          </CardContent>
        </Card>
        <WorkoutVolumeCard />
      </div>

      <TrainerActivityFeed />
      <BodyProgressCard />
    </div>
  );
}
