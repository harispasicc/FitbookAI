"use client";

import { BusyDots } from "@/components/ui/busy-dots";
import { cn } from "@/lib/utils";

type AuthTransitionScreenProps = {
  variant?: "card" | "fullscreen";
  className?: string;
};

export function AuthTransitionScreen({
  variant = "card",
  className,
}: AuthTransitionScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex items-center justify-center",
        variant === "fullscreen" ? "min-h-dvh bg-background" : "min-h-[14rem] py-10",
        className,
      )}
    >
      <BusyDots size="lg" />
    </div>
  );
}
