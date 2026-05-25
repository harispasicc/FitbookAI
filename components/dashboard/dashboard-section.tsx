"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DashboardSection({
  title,
  description,
  action,
  children,
  className,
  priority = "default",
  dense = false,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  priority?: "primary" | "secondary" | "default";
  dense?: boolean;
}) {
  return (
    <section
      className={cn(
        "min-w-0",
        dense ? "space-y-3" : "space-y-4",
        priority === "primary" &&
          "rounded-2xl border-0 bg-muted/20 p-4 shadow-sm sm:p-5",
        priority === "secondary" && "opacity-[0.98]",
        className,
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <h2
            className={cn(
              "font-bold tracking-tight text-foreground",
              priority === "primary"
                ? "text-lg sm:text-xl"
                : "text-base font-semibold sm:text-lg",
            )}
          >
            {title}
          </h2>
          {description ? (
            <p className="text-sm font-medium leading-snug text-muted-foreground/85">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
