"use client";

import { memo, useMemo } from "react";
import {
  Activity,
  CheckCircle2,
  Sparkles,
  Star,
  Target,
  UserPlus,
  XCircle,
} from "lucide-react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { BusyDots } from "@/components/ui/busy-dots";
import { EmptyState } from "@/components/ui/empty-state";
import { TrainerAvatar } from "@/components/visual/trainer-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useTrainerAnalytics } from "@/hooks/use-trainer-workspace";
import type { TrainerAnalyticsDto } from "@/lib/trainer-portal-api";
import { cn } from "@/lib/utils";

function iconForType(type: TrainerAnalyticsDto["recentActivity"][0]["type"]) {
  switch (type) {
    case "confirmed":
      return CheckCircle2;
    case "completed":
      return Target;
    case "cancelled":
      return XCircle;
    case "review":
      return Star;
    case "ai":
      return Sparkles;
    case "goal":
      return Target;
    case "booked":
    default:
      return UserPlus;
  }
}

function accentForType(type: TrainerAnalyticsDto["recentActivity"][0]["type"]) {
  switch (type) {
    case "confirmed":
      return "border-l-emerald-500 bg-emerald-500/[0.04]";
    case "completed":
      return "border-l-teal-500 bg-teal-500/[0.04]";
    case "cancelled":
      return "border-l-destructive bg-destructive/[0.04]";
    case "review":
      return "border-l-orange-500 bg-orange-500/[0.04]";
    case "ai":
      return "border-l-violet-500 bg-violet-500/[0.04]";
    default:
      return "border-l-border bg-muted/20";
  }
}

function iconTone(type: TrainerAnalyticsDto["recentActivity"][0]["type"]) {
  switch (type) {
    case "confirmed":
      return "bg-emerald-500/15 text-emerald-700";
    case "completed":
      return "bg-teal-500/15 text-teal-700";
    case "cancelled":
      return "bg-destructive/15 text-destructive";
    case "review":
      return "bg-orange-500/15 text-orange-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function groupLabel(time: string): string {
  if (time === "Just now" || time.endsWith("min ago") || time.endsWith("h ago")) {
    return "Today";
  }
  if (time.endsWith("d ago")) {
    const d = parseInt(time, 10);
    if (d <= 7) return "This week";
  }
  return "Earlier";
}

export const TrainerActivityFeed = memo(function TrainerActivityFeed({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { analytics, loading } = useTrainerAnalytics();
  const items = useMemo(
    () => analytics?.recentActivity ?? [],
    [analytics?.recentActivity],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const it of items) {
      const g = groupLabel(it.time);
      const list = map.get(g) ?? [];
      list.push(it);
      map.set(g, list);
    }
    return [...map.entries()];
  }, [items]);

  const body = (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-card via-card to-violet-500/[0.03] shadow-md",
        embedded && "shadow-none ring-0",
      )}
    >
      <CardContent className="p-0">
        {loading && items.length === 0 ? (
          <div className="flex justify-center py-6">
            <BusyDots size="sm" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              compact
              icon={Activity}
              title="No activity yet"
              description="When clients book, confirm, or complete sessions, updates stream here."
            />
          </div>
        ) : (
          <div className="max-h-[20rem] overflow-y-auto">
            {grouped.map(([group, groupItems]) => (
              <div key={group}>
                <p className="sticky top-0 z-10 border-b border-border/60 bg-card/95 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm">
                  {group}
                </p>
                <ul>
                  {groupItems.map((it) => {
                    const Icon = iconForType(it.type);
                    return (
                      <li
                        key={it.id}
                        className={cn(
                          "flex gap-3 border-b border-border/40 border-l-[3px] px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/15",
                          accentForType(it.type),
                        )}
                      >
                        <TrainerAvatar seed={it.clientName} size="sm" className="shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                            <p className="text-sm font-semibold text-foreground">{it.clientName}</p>
                            <span className="text-xs text-muted-foreground">·</span>
                            <p className="text-sm text-foreground/90">{it.title}</p>
                          </div>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {it.subtitle}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <span
                            className={cn(
                              "flex size-7 items-center justify-center rounded-full",
                              iconTone(it.type),
                            )}
                          >
                            <Icon className="size-3.5" aria-hidden />
                          </span>
                          <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                            {it.time}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (embedded) return body;

  return (
    <DashboardSection
      title="Recent activity"
      description="Live workspace timeline — bookings, sessions, and updates."
      dense
      priority="primary"
    >
      {body}
    </DashboardSection>
  );
});
