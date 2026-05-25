import { cn } from "@/lib/utils";

const lift =
  "transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md";

export const clientCard = {
  stat: cn(
    "h-full overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-teal-500/[0.07] via-card to-violet-500/[0.03]",
    "shadow-sm shadow-teal-500/5",
    lift,
  ),
  panel: cn("rounded-2xl border-0 bg-card shadow-md shadow-black/[0.04]", lift),
  panelTint: cn("rounded-2xl border-0 bg-muted/30 shadow-sm", lift),
  panelAccent: cn(
    "rounded-2xl border-0 bg-gradient-to-br from-violet-500/[0.08] via-card to-teal-500/[0.04]",
    "shadow-md shadow-violet-500/8",
    lift,
  ),
  coachHero: cn(
    "overflow-hidden rounded-2xl border-0 bg-card shadow-lg shadow-black/[0.05]",
  ),
  listItem: "rounded-xl border-0 bg-background/80 px-3 py-2.5 shadow-sm",
  notify: (tone: "success" | "warning" | "info" | "neutral") => {
    switch (tone) {
      case "success":
        return "rounded-xl border-0 bg-emerald-500/[0.08] shadow-sm";
      case "warning":
        return "rounded-xl border-0 bg-amber-500/[0.08] shadow-sm";
      case "info":
        return "rounded-xl border-0 bg-sky-500/[0.08] shadow-sm";
      default:
        return "rounded-xl border-0 bg-muted/40 shadow-sm";
    }
  },
} as const;
