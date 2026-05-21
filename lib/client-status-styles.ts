import type { TrainerClientDto } from "@/lib/trainer-portal-api";
import { cn } from "@/lib/utils";

export function clientStatusBadgeClass(status: TrainerClientDto["status"]) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-500/40";
    case "paused":
      return "bg-muted text-foreground ring-1 ring-border";
    case "trial":
      return "bg-orange-100 text-neutral-950 ring-1 ring-orange-400/50";
    default:
      return "bg-muted text-foreground ring-1 ring-border";
  }
}

export function clientStatusBadgeMarkup(status: TrainerClientDto["status"]) {
  return cn(
    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1",
    clientStatusBadgeClass(status),
  );
}
