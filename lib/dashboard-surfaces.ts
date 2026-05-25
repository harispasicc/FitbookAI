import { cn } from "@/lib/utils";

const lift =
  "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg";

export const dashCard = {
  hero: cn(
    "overflow-hidden rounded-2xl border border-orange-500/25",
    "bg-gradient-to-br from-orange-500/[0.14] via-card to-teal-500/[0.06]",
    "shadow-xl shadow-orange-500/12",
    lift,
  ),
  heroIdle: cn(
    "overflow-hidden rounded-2xl border-0 bg-card",
    "shadow-md shadow-black/[0.04]",
    lift,
  ),
  statCluster: cn(
    "rounded-2xl border-0 bg-muted/30 shadow-sm shadow-black/[0.03]",
    lift,
  ),
  kpiFeatured: cn(
    "rounded-2xl border-0",
    "bg-gradient-to-br from-teal-500/[0.1] via-card to-violet-500/[0.03]",
    "shadow-md shadow-teal-500/10",
    lift,
  ),
  kpiBookings: cn(
    "rounded-2xl border-0 bg-orange-500/[0.06] shadow-sm shadow-orange-500/5",
    lift,
  ),
  kpiClients: cn(
    "rounded-2xl border-0 bg-teal-500/[0.06] shadow-sm shadow-teal-500/5",
    lift,
  ),
  kpiRetention: cn(
    "rounded-2xl border-0 bg-slate-500/[0.06] shadow-sm",
    lift,
  ),
  kpiAi: cn(
    "rounded-2xl border-0 bg-gradient-to-br from-violet-500/[0.08] to-primary/[0.04]",
    "shadow-sm shadow-violet-500/10",
    lift,
  ),
  analyticsHero: cn(
    "rounded-2xl border-0 bg-card shadow-lg shadow-orange-500/[0.06]",
    lift,
  ),
  chartInset: cn(
    "rounded-2xl border-0 bg-muted/40 shadow-sm shadow-black/[0.03]",
    lift,
  ),
  statPill: "rounded-2xl border-0 bg-teal-500/[0.07] shadow-sm",
  statPillAlt: "rounded-2xl border-0 bg-orange-500/[0.06] shadow-sm",
  patternRail: cn(
    "rounded-2xl border-0 bg-gradient-to-r from-muted/70 via-muted/30 to-transparent",
    "shadow-sm",
  ),
  upcomingShell: cn(
    "overflow-hidden rounded-2xl border-0 bg-card",
    "shadow-lg shadow-black/[0.05]",
    lift,
  ),
  intelHero: cn(
    "overflow-hidden rounded-2xl border-0",
    "bg-gradient-to-br from-violet-500/[0.1] via-card to-teal-500/[0.05]",
    "shadow-lg shadow-violet-500/10",
    lift,
  ),
  panelTint: "rounded-2xl border-0 bg-teal-500/[0.05] shadow-sm",
  panelTintAlt: "rounded-2xl border-0 bg-slate-500/[0.05] shadow-sm",
} as const;

export type IntelListVariant = "active" | "churn" | "inactive";

export function intelListSurface(variant: IntelListVariant) {
  switch (variant) {
    case "active":
      return cn(
        "rounded-2xl border-0 border-l-[3px] border-l-teal-500",
        "bg-teal-500/[0.06] shadow-sm",
        lift,
      );
    case "churn":
      return cn(
        "rounded-2xl border-0 border-l-[3px] border-l-orange-500",
        "bg-orange-500/[0.05] shadow-sm",
        lift,
      );
    case "inactive":
      return cn(
        "rounded-2xl border-0 border-l-[3px] border-l-slate-400",
        "bg-slate-500/[0.05] shadow-sm",
        lift,
      );
  }
}
