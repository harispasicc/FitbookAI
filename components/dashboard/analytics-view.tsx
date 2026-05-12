"use client";
import { BodyProgressCard } from "@/components/visual/body-progress-card";
import { AreaTrendChart, DonutKpi, WeeklyBarsChart } from "@/components/visual/fitness-charts";
import { WorkoutVolumeCard } from "@/components/visual/workout-volume-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDemoData } from "@/hooks/use-demo-data";
function fmtMoney(n: number) {
    return `$${n.toLocaleString("en-US")}`;
}
export function AnalyticsView() {
    const { data } = useDemoData();
    const a = data?.analytics;
    const kpis = a
        ? [
            { label: "Bookings", value: String(a.bookingsCount) },
            { label: "Revenue (30d)", value: fmtMoney(a.revenue30d) },
            { label: "Active clients", value: String(a.activeClients) },
            { label: "Retention", value: `${a.retentionPct}%` },
        ]
        : [
            { label: "Bookings", value: "—" },
            { label: "Revenue (30d)", value: "—" },
            { label: "Active clients", value: "—" },
            { label: "Retention", value: "—" },
        ];
    const revenueTrend = [9.2, 9.8, 9.4, 10.1, 10.6, 11.0, 11.4, 11.8, 12.1, 12.48];
    const bookingsWeek = [12, 16, 14, 18, 15, 9, 11];
    const retention = a?.retentionPct ?? 88;
    return (<div className="min-w-0 space-y-6 sm:space-y-8">
      <div className="min-w-0 space-y-1">
        <h1 className="text-balance text-xl font-semibold tracking-tight min-[400px]:text-2xl">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Bookings, revenue, active clients, retention — charts on your saved workspace data.
        </p>
      </div>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (<Card key={k.label} className="rounded-2xl border border-border/80 bg-gradient-to-br from-card to-orange-500/[0.03] shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{k.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tabular-nums">{k.value}</p>
            </CardContent>
          </Card>))}
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-3">
        <Card className="min-w-0 rounded-2xl border border-border/80 bg-card/90 shadow-sm backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue trend</CardTitle>
            <CardDescription>Trailing 10 periods (thousands USD, sample)</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="h-48 min-h-[12rem] w-full min-w-0 rounded-2xl border border-border/60 bg-muted/15 p-2 sm:h-56">
              <AreaTrendChart values={revenueTrend} fillGradientId="an-rev-area"/>
            </div>
          </CardContent>
        </Card>
        <div className="flex min-w-0 flex-col gap-4">
          <Card className="rounded-2xl border border-border/80 bg-card/90 shadow-sm backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Retention pulse</CardTitle>
              <CardDescription>Goal vs current (illustrative)</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-2">
              <DonutKpi pct={retention} trackClass="stroke-zinc-200" arcClass="stroke-teal-500"/>
            </CardContent>
          </Card>
          <WorkoutVolumeCard />
        </div>
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <Card className="min-w-0 rounded-2xl border border-border/80 bg-card/90 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Sessions by weekday</CardTitle>
            <CardDescription>Volume proxy for floor traffic (sample)</CardDescription>
          </CardHeader>
          <CardContent className="min-w-0">
            <div className="h-36 min-h-[9rem] w-full min-w-0 rounded-2xl border border-border/60 bg-muted/15 p-2 sm:h-40">
              <WeeklyBarsChart values={bookingsWeek} barClassName="fill-orange-500/78"/>
            </div>
          </CardContent>
        </Card>
        <BodyProgressCard />
      </div>
    </div>);
}
