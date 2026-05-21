"use client";

import { BarChart3 } from "lucide-react";
import { BusyDots } from "@/components/ui/busy-dots";
import { motion } from "framer-motion";
import { AreaTrendChart } from "@/components/visual/fitness-charts";
import { BookingsTable } from "@/components/dashboard/bookings-table";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { StatCards } from "@/components/dashboard/stat-cards";
import { TodaySessions } from "@/components/dashboard/today-sessions";
import { TrainerActivityFeed } from "@/components/dashboard/trainer-activity-feed";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrainerAnalytics } from "@/hooks/use-trainer-workspace";

function RevenueChart({ values }: { values: number[] }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}>
      <Card className="h-full rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-orange-500/[0.03] shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BarChart3 className="size-4 text-muted-foreground" aria-hidden />
            Revenue trend
          </CardTitle>
          <CardDescription>Last 10 weeks from confirmed & completed bookings (€)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-36 w-full rounded-xl border border-border/60 bg-muted/15 p-2">
            <AreaTrendChart values={values} fillGradientId="dash-rev-area" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ClientLoadChart({
  active,
  paused,
  trial,
}: {
  active: number;
  paused: number;
  trial: number;
}) {
  const total = Math.max(active + paused + trial, 1);
  const segments = [
    { label: "Active", value: active, className: "bg-emerald-500" },
    { label: "Trial", value: trial, className: "bg-orange-500" },
    { label: "Paused", value: paused, className: "bg-muted-foreground/40" },
  ];

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}>
      <Card className="h-full rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-orange-500/[0.03] shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BarChart3 className="size-4 text-muted-foreground" aria-hidden />
            Client load
          </CardTitle>
          <CardDescription>Active vs trial vs paused clients</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex h-8 overflow-hidden rounded-lg border border-border/80">
            {segments.map((s) => (
              <div
                key={s.label}
                className={s.className}
                style={{ width: `${(s.value / total) * 100}%` }}
                title={`${s.label}: ${s.value}`}
              />
            ))}
          </div>
          <ul className="grid grid-cols-3 gap-2 text-center text-xs">
            {segments.map((s) => (
              <li key={s.label}>
                <p className="font-semibold tabular-nums text-foreground">{s.value}</p>
                <p className="text-muted-foreground">{s.label}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function TrainerDashboardView() {
  const { analytics, loading } = useTrainerAnalytics();

  return (
    <div className="flex min-w-0 flex-col gap-6 sm:gap-8 md:gap-10">
      <div className="min-w-0 space-y-1">
        <h1 className="text-balance text-xl font-semibold tracking-tight min-[400px]:text-2xl">
          Dashboard
        </h1>
        <p className="text-pretty text-sm text-muted-foreground">
          Revenue, retention, and session rhythm from your live bookings.
        </p>
      </div>

      <StatCards />

      {loading && !analytics ? (
        <div className="flex justify-center py-8">
          <BusyDots />
        </div>
      ) : (
        <div className="grid min-w-0 gap-4 md:grid-cols-2 lg:gap-6">
          <RevenueChart values={analytics?.revenueTrend ?? []} />
          <ClientLoadChart
            active={analytics?.clientLoad.active ?? 0}
            paused={analytics?.clientLoad.paused ?? 0}
            trial={analytics?.clientLoad.trial ?? 0}
          />
        </div>
      )}

      <div className="grid min-w-0 gap-6 md:gap-8 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <TodaySessions />
          <BookingsTable />
        </div>
        <div className="min-w-0 space-y-6">
          <QuickActions />
          <TrainerActivityFeed />
        </div>
      </div>
    </div>
  );
}
