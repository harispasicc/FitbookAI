"use client";

import { motion } from "framer-motion";
import { CalendarCheck, CreditCard, Percent, Sparkles, Users } from "lucide-react";
import { BusyDots } from "@/components/ui/busy-dots";
import { Sparkline } from "@/components/visual/sparkline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrainerAnalytics } from "@/hooks/use-trainer-workspace";

export function StatCards() {
  const { analytics: a, loading } = useTrainerAnalytics();

  const stats = [
    {
      title: "Revenue (30d)",
      value: a?.revenue30dLabel ?? (loading ? "…" : "—"),
      hint: a ? "Confirmed & completed sessions" : "From your live bookings",
      icon: CreditCard,
      series: a?.revenueTrend ?? [0, 0, 0, 0, 0, 0, 0, 0],
      stroke: "stroke-teal-600",
      gid: "dash-sp-rev",
    },
    {
      title: "Bookings",
      value: a ? String(a.bookingsCount) : loading ? "…" : "—",
      hint: a ? "Last 30 days" : "—",
      icon: CalendarCheck,
      series: a?.bookingsTrend ?? [0, 0, 0, 0, 0, 0, 0, 0],
      stroke: "stroke-orange-500",
      gid: "dash-sp-book",
    },
    {
      title: "Active clients",
      value: a ? String(a.activeClients) : loading ? "…" : "—",
      hint: a ? "With upcoming or recent sessions" : "—",
      icon: Users,
      series: [
        a?.clientLoad.active ?? 0,
        a?.clientLoad.trial ?? 0,
        a?.clientLoad.paused ?? 0,
        a?.activeClients ?? 0,
        a?.activeClients ?? 0,
        a?.activeClients ?? 0,
        a?.activeClients ?? 0,
        a?.activeClients ?? 0,
      ],
      stroke: "stroke-teal-500",
      gid: "dash-sp-cli",
    },
    {
      title: "Retention",
      value: a ? `${a.retentionPct}%` : loading ? "…" : "—",
      hint: a ? "Clients with 2+ sessions" : "—",
      icon: Percent,
      series: a
        ? [
            a.retentionPct,
            a.retentionPct,
            a.retentionPct,
            a.retentionPct,
            a.retentionPct,
            a.retentionPct,
            a.retentionPct,
            a.retentionPct,
          ]
        : [0, 0, 0, 0, 0, 0, 0, 0],
      stroke: "stroke-orange-500",
      gid: "dash-sp-ret",
    },
    {
      title: "AI reminders",
      value: a ? String(a.aiRemindersGenerated) : loading ? "…" : "—",
      hint: "FitBook AI usage",
      icon: Sparkles,
      series: [0, 0, 0, 0, 0, 0, 0, 0],
      stroke: "stroke-teal-600",
      gid: "dash-sp-ai",
    },
  ] as const;

  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5">
      {loading && !a ? (
        <div className="col-span-full flex justify-center py-4 sm:col-span-2 xl:col-span-5">
          <BusyDots size="sm" />
        </div>
      ) : null}
      {stats.map(({ title, value, hint, icon: Icon, series, stroke, gid }) => (
        <motion.div
          key={title}
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
        >
          <Card className="h-full rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-teal-500/[0.04] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
              <span className="flex size-8 items-center justify-center rounded-xl border border-border/80 bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm">
                <Icon className="size-4" aria-hidden />
              </span>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
              <div className="flex items-end justify-between gap-2">
                <p className="min-w-0 flex-1 text-xs text-muted-foreground">{hint}</p>
                <Sparkline
                  values={series}
                  strokeClassName={stroke}
                  gradientId={gid}
                  className="shrink-0 opacity-95"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
