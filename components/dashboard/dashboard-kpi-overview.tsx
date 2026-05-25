"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  CreditCard,
  Percent,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { Card, CardContent } from "@/components/ui/card";
import { useTrainerAnalytics } from "@/hooks/use-trainer-workspace";
import type { KpiTrendDto, TrainerAnalyticsDto } from "@/lib/trainer-portal-api";
import { DashboardKpiSkeleton } from "@/components/dashboard/dashboard-motion";
import { dashCard } from "@/lib/dashboard-surfaces";
import { dashMuted } from "@/lib/dashboard-typography";
import { cn } from "@/lib/utils";

type KpiVariant = "featured" | "bookings" | "clients" | "retention" | "ai";

const kpiSurface: Record<KpiVariant, string> = {
  featured: dashCard.kpiFeatured,
  bookings: dashCard.kpiBookings,
  clients: dashCard.kpiClients,
  retention: dashCard.kpiRetention,
  ai: dashCard.kpiAi,
};

function TrendBadge({ trend }: { trend: KpiTrendDto }) {
  const Icon =
    trend.direction === "up"
      ? TrendingUp
      : trend.direction === "down"
        ? TrendingDown
        : null;
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold leading-tight",
        trend.show && trend.direction === "up" && "bg-emerald-500/10 text-emerald-700",
        trend.show && trend.direction === "down" && "bg-orange-500/10 text-orange-700",
        (!trend.show || trend.direction === "neutral") && "bg-muted/30 text-muted-foreground",
      )}
    >
      {trend.show && Icon ? <Icon className="size-3 shrink-0" aria-hidden /> : null}
      <span className="truncate">{trend.label}</span>
    </span>
  );
}

function KpiCard({
  title,
  value,
  insight,
  icon: Icon,
  trend,
  variant = "bookings",
}: {
  title: string;
  value: string;
  insight: string;
  icon: typeof CreditCard;
  trend: KpiTrendDto;
  variant?: KpiVariant;
}) {
  const featured = variant === "featured";
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 500, damping: 32 }}
      className={cn(featured && "sm:col-span-2 xl:col-span-2")}
    >
      <Card className={cn("h-full border-0", kpiSurface[variant])}>
        <CardContent className="space-y-2.5 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className={dashMuted}>{title}</p>
              <p
                className={cn(
                  "font-bold tabular-nums tracking-tight text-foreground",
                  featured ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
                )}
              >
                {value}
              </p>
            </div>
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                featured
                  ? "bg-teal-500/15 text-teal-700"
                  : variant === "ai"
                    ? "bg-violet-500/15 text-violet-700"
                    : variant === "bookings"
                      ? "bg-orange-500/15 text-orange-700"
                      : "bg-muted/50 text-muted-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden />
            </span>
          </div>
          <TrendBadge trend={trend} />
          <p className="text-xs font-medium leading-snug text-muted-foreground/80">{insight}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function buildKpiConfig(a: TrainerAnalyticsDto | null, loading: boolean) {
  const h = a?.highlights;
  const hasRevenue = (a?.revenue30dCents ?? 0) > 0;

  return [
    {
      title: "Revenue (30d)",
      value: a?.revenue30dLabel ?? (loading ? "…" : "—"),
      insight: hasRevenue
        ? h && h.bestWeekRevenueEur > 0
          ? `Best week €${h.bestWeekRevenueEur} · confirmed & completed`
          : "Revenue from confirmed and completed sessions"
        : "Complete more sessions to unlock revenue trends.",
      icon: CreditCard,
      trend: a?.kpiTrends.revenue ?? { label: "—", direction: "neutral" as const, show: false },
      variant: "featured" as const,
    },
    {
      title: "Bookings",
      value: a ? String(a.bookingsCount) : loading ? "…" : "—",
      insight: "Sessions booked in the last 30 days",
      icon: CalendarCheck,
      trend: a?.kpiTrends.bookings ?? { label: "—", direction: "neutral" as const, show: false },
      variant: "bookings" as const,
    },
    {
      title: "Active clients",
      value: a ? String(a.activeClients) : loading ? "…" : "—",
      insight:
        a?.kpiTrends.activeClients.show && a.kpiTrends.activeClients.label !== "No new clients yet"
          ? a.kpiTrends.activeClients.label
          : "Clients with upcoming or recent activity",
      icon: Users,
      trend: a?.kpiTrends.activeClients ?? { label: "—", direction: "neutral" as const, show: false },
      variant: "clients" as const,
    },
    {
      title: "Retention",
      value: a ? `${a.retentionPct}%` : loading ? "…" : "—",
      insight:
        a?.emptyHints.retention ?? "Share of clients with repeat bookings",
      icon: Percent,
      trend: a?.kpiTrends.retention ?? { label: "—", direction: "neutral" as const, show: false },
      variant: "retention" as const,
    },
    {
      title: "AI insights",
      value: a ? String(a.aiRemindersGenerated) : loading ? "…" : "—",
      insight: "Reminders generated via FitBook AI",
      icon: Sparkles,
      trend: a?.kpiTrends.aiInsights ?? { label: "—", direction: "neutral" as const, show: false },
      variant: "ai" as const,
    },
  ];
}

export const DashboardKpiOverview = memo(function DashboardKpiOverview() {
  const { analytics: a, loading } = useTrainerAnalytics();
  const cards = buildKpiConfig(a, loading);

  return (
    <DashboardSection
      title="Overview"
      description="Key metrics with trends — no noise, just signal."
      dense
      priority="primary"
    >
      {loading && !a ? (
        <DashboardKpiSkeleton />
      ) : (
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-6">
          {cards.map((c) => (
            <KpiCard
              key={c.title}
              title={c.title}
              value={c.value}
              insight={c.insight}
              icon={c.icon}
              trend={c.trend}
              variant={c.variant}
            />
          ))}
        </div>
      )}
    </DashboardSection>
  );
});
