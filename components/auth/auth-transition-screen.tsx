"use client";

import { BusyDots } from "@/components/ui/busy-dots";
import { cn } from "@/lib/utils";

type AuthTransitionScreenProps = {
  label?: string;
  variant?: "card" | "fullscreen";
  className?: string;
};

export function AuthTransitionScreen({
  label = "Loading",
  variant = "card",
  className,
}: AuthTransitionScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        variant === "fullscreen" ? "min-h-dvh bg-background" : "min-h-[14rem] py-10",
        className,
      )}
    >
      <BusyDots size="lg" label={label} />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
