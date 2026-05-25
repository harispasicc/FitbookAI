"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, stiffness: 420, damping: 30 };

export function AnimatedCounter({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);

  useEffect(() => {
    const target = Math.max(0, Math.round(value));
    const from = displayRef.current;
    const start = performance.now();
    const duration = 520;
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      const next = Math.round(from + (target - from) * eased);
      setDisplay(next);
      displayRef.current = next;
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span className={cn("tabular-nums", className)}>{display}</span>;
}

export function DashReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function DashboardKpiSkeleton() {
  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "space-y-3 rounded-2xl bg-muted/30 p-4 shadow-sm",
            i === 0 && "sm:col-span-2 xl:col-span-2",
          )}
        >
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  );
}

export function DashboardChartSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className={cn("space-y-3 rounded-2xl bg-muted/30 p-4 shadow-sm", tall && "min-h-[12rem]")}>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-48" />
      <Skeleton className={cn("w-full rounded-lg", tall ? "h-40" : "h-28")} />
    </div>
  );
}

export function DashboardTodaySkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-36 rounded-2xl lg:col-span-3" />
        <Skeleton className="h-36 rounded-2xl lg:col-span-2" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-32 rounded-2xl lg:col-span-2" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
