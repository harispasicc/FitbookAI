"use client";

import { memo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  Sparkles,
  TrendingUp,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { BusyDots } from "@/components/ui/busy-dots";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTrainerAnalytics } from "@/hooks/use-trainer-workspace";
import { dashCard, intelListSurface, type IntelListVariant } from "@/lib/dashboard-surfaces";
import { cn } from "@/lib/utils";

function IntelClientList({
  title,
  rows,
  empty,
  variant,
}: {
  title: string;
  rows: { id: string; name: string; meta: string }[];
  empty: string;
  variant: IntelListVariant;
}) {
  const icon =
    variant === "active" ? UserPlus : variant === "churn" ? UserMinus : Users;
  const Icon = icon;

  return (
    <Card className={intelListSurface(variant)}>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-lg",
              variant === "active" && "bg-teal-500/15 text-teal-700",
              variant === "churn" && "bg-orange-500/15 text-orange-700",
              variant === "inactive" && "bg-slate-500/15 text-slate-600",
            )}
          >
            <Icon className="size-4" aria-hidden />
          </span>
          <p className="text-sm font-bold text-foreground">{title}</p>
        </div>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          <ul className="space-y-1.5">
            {rows.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/clients/${r.id}`}
                  className="flex items-center justify-between gap-2 rounded-lg bg-background/70 px-3 py-2 text-sm transition hover:bg-background"
                >
                  <span className="truncate font-medium">{r.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{r.meta}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

const toneStyles = {
  warning: "border-orange-500/25 bg-orange-500/[0.06] ring-orange-500/15",
  success: "border-emerald-500/25 bg-emerald-500/[0.06] ring-emerald-500/15",
  neutral: "border-border/50 bg-muted/20 ring-border/40",
} as const;

export const DashboardClientInsights = memo(function DashboardClientInsights() {
  const { analytics: a, loading } = useTrainerAnalytics();
  const ci = a?.clientInsights;
  const intel = a?.intelligence;

  return (
    <DashboardSection
      title="Intelligence"
      description="Actionable signals — retention, churn, and what to do next."
      priority="secondary"
    >
      {loading && !a ? (
        <div className="flex justify-center py-4">
          <BusyDots size="sm" />
        </div>
      ) : (
        <div className="space-y-4">
          <Card className={cn("border-0", dashCard.intelHero)}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                    <Sparkles className="size-4" aria-hidden />
                    Coach intelligence
                  </div>
                  <p className="text-lg font-bold leading-snug tracking-tight text-foreground sm:text-xl">
                    {intel?.headline ?? "Your workspace is building momentum."}
                  </p>
                  {a?.highlights.bestService ? (
                    <p className="text-sm text-muted-foreground/90">
                      Top service: {a.highlights.bestService}
                      {a.highlights.peakDayName
                        ? ` · Peak day: ${a.highlights.peakDayName}`
                        : null}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {[
                    { label: "Avg sessions", value: String(ci?.avgSessionsPerClient ?? 0) },
                    {
                      label: "Returning",
                      value: a?.emptyHints.retention ? "—" : `${ci?.returningClientPct ?? 0}%`,
                    },
                    { label: "At risk", value: String(ci?.churnRisk.length ?? 0), warn: true },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className={cn(
                        "rounded-xl px-3 py-2 ring-1 ring-inset",
                        m.warn && (ci?.churnRisk.length ?? 0) > 0
                          ? "bg-orange-500/10 ring-orange-500/25"
                          : "bg-background/80 ring-border/50",
                      )}
                    >
                      <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
                      <p className="text-lg font-bold tabular-nums">{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {(intel?.recommendations.length ?? 0) > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {intel!.recommendations.map((rec) => (
                <Link
                  key={rec.id}
                  href={rec.href}
                  className={cn(
                    "group flex items-start gap-3 rounded-xl border-0 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
                    toneStyles[rec.tone],
                  )}
                >
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      rec.tone === "warning"
                        ? "bg-orange-500/15 text-orange-700"
                        : rec.tone === "success"
                          ? "bg-emerald-500/15 text-emerald-700"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {rec.tone === "warning" ? (
                      <AlertTriangle className="size-4" aria-hidden />
                    ) : rec.tone === "success" ? (
                      <TrendingUp className="size-4" aria-hidden />
                    ) : (
                      <Lightbulb className="size-4" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">{rec.title}</p>
                    <p className="mt-0.5 text-sm leading-snug text-muted-foreground/90">
                      {rec.detail}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          ) : null}

          <Card className="rounded-2xl border-0 bg-muted/30 shadow-sm">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                <Lightbulb className="size-4 text-primary" aria-hidden />
                Signals
              </div>
              <ul className="grid gap-2 sm:grid-cols-2">
                {(a?.smartInsights ?? []).map((line, i) => (
                  <li
                    key={`insight-${i}`}
                    className="rounded-lg bg-background/90 px-3 py-2.5 text-sm font-medium leading-snug text-foreground shadow-sm"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="grid gap-3 md:grid-cols-3">
            <IntelClientList
              title="Most active"
              variant="active"
              rows={(ci?.mostActive ?? []).map((r) => ({
                id: r.id,
                name: r.name,
                meta: r.meta,
              }))}
              empty="Ranks appear after repeat sessions."
            />
            <IntelClientList
              title="Churn risk"
              variant="churn"
              rows={(ci?.churnRisk ?? []).map((r) => ({
                id: r.id,
                name: r.name,
                meta: r.meta,
              }))}
              empty="No idle clients flagged."
            />
            <IntelClientList
              title="Inactive"
              variant="inactive"
              rows={(ci?.inactive ?? []).map((r) => ({
                id: r.id,
                name: r.name,
                meta: r.meta,
              }))}
              empty="No paused clients."
            />
          </div>

          {(ci?.churnRisk.length ?? 0) > 0 ? (
            <div className="flex justify-end">
              <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                <Link href="/clients">View all clients</Link>
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </DashboardSection>
  );
});
