"use client";

import { useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { dashChartLabel } from "@/lib/dashboard-typography";
import { cn } from "@/lib/utils";

function buildYTicks(max: number): number[] {
  if (max <= 0) return [0];
  const candidates = [0, Math.round((max / 2) * 10) / 10, Math.round(max * 10) / 10];
  const unique: number[] = [];
  for (const t of candidates) {
    if (!unique.some((u) => Math.abs(u - t) < 0.001)) unique.push(t);
  }
  return unique.sort((a, b) => a - b);
}

function formatAxisValue(value: number, suffix: string): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k${suffix}`;
  if (Number.isInteger(value)) return `${value}${suffix}`;
  return `${value.toFixed(1)}${suffix}`;
}

function smoothLinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;
  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(i + 2, points.length - 1)]!;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

type Props = {
  values: number[];
  className?: string;
  heightClass?: string;
  fillGradientId?: string;
  valueSuffix?: string;
  comparisonLabel?: string | null;
};

export function InteractiveAreaChart({
  values,
  className,
  heightClass = "h-[10rem]",
  fillGradientId: fillGradientIdProp,
  valueSuffix = "€",
  comparisonLabel,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const fillGradientId = fillGradientIdProp ?? `rev-fill-${uid}`;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const series = useMemo(
    () => (values.length < 2 ? [...values, values[0] ?? 0] : values),
    [values],
  );
  const max = Math.max(...series, 0.01);
  const ticks = buildYTicks(max);
  const active = activeIndex ?? series.length - 1;
  const activeValue = series[active] ?? 0;
  const prevValue = active > 0 ? (series[active - 1] ?? 0) : null;
  const delta =
    prevValue != null && prevValue > 0
      ? Math.round(((activeValue - prevValue) / prevValue) * 100)
      : null;

  const weekLabels = useMemo(
    () =>
      series.map((_, i) => {
        if (i === series.length - 1) return "Now";
        const weeksAgo = series.length - 1 - i;
        return weeksAgo === 1 ? "1w ago" : `${weeksAgo}w ago`;
      }),
    [series],
  );

  const padX = 4;
  const padTop = 6;
  const padBottom = 14;

  const pts = series.map((v, i) => {
    const xPct = padX + (i / Math.max(series.length - 1, 1)) * (100 - padX * 2);
    const yPct = padTop + (1 - v / max) * (100 - padTop - padBottom);
    return { xPct, yPct, v, i };
  });

  const linePath = smoothLinePath(pts.map((p) => ({ x: p.xPct, y: p.yPct })));
  const areaPath = `${linePath} L ${pts[pts.length - 1]!.xPct} ${100 - padBottom} L ${pts[0]!.xPct} ${100 - padBottom} Z`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className={cn("relative flex flex-col", heightClass, className)}
    >
      <div className="mb-1.5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className={dashChartLabel}>{weekLabels[active]}</p>
          <motion.p
            key={active}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-bold tabular-nums tracking-tight text-foreground"
          >
            {formatAxisValue(activeValue, valueSuffix)}
          </motion.p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          {comparisonLabel ? (
            <p className="text-xs font-semibold text-muted-foreground/85">
              {comparisonLabel}
            </p>
          ) : null}
          {delta != null && activeIndex !== null ? (
            <p
              className={cn(
                "text-xs font-bold tabular-nums",
                delta >= 0 ? "text-emerald-600" : "text-orange-600",
              )}
            >
              {delta >= 0 ? "+" : ""}
              {delta}% vs prior week
            </p>
          ) : null}
        </div>
      </div>

      <div
        className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-gradient-to-b from-orange-500/[0.08] via-muted/20 to-transparent shadow-inner"
        onMouseLeave={() => setActiveIndex(null)}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
          aria-hidden
        >
          <defs>
            <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(251 146 60)" stopOpacity="0.5" />
              <stop offset="45%" stopColor="rgb(20 184 166)" stopOpacity="0.15" />
              <stop offset="100%" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((tick, ti) => {
            const y = padTop + (1 - tick / max) * (100 - padTop - padBottom);
            return (
              <line
                key={`grid-${ti}-${tick}`}
                x1={padX}
                y1={y}
                x2={100 - padX}
                y2={y}
                stroke="currentColor"
                className={tick === 0 ? "text-border/35" : "text-border/15"}
                strokeWidth="0.35"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          <motion.path
            d={areaPath}
            fill={`url(#${fillGradientId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          />
          <motion.path
            d={linePath}
            fill="none"
            stroke="rgb(234 88 12)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0.6 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
          {activeIndex !== null ? (
            <line
              x1={pts[activeIndex]!.xPct}
              y1={padTop}
              x2={pts[activeIndex]!.xPct}
              y2={100 - padBottom}
              stroke="rgb(234 88 12)"
              strokeOpacity={0.25}
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
        </svg>

        <div className="absolute inset-0 flex">
          {pts.map((p) => (
            <button
              key={`hover-${p.i}`}
              type="button"
              className="h-full flex-1 cursor-crosshair bg-transparent"
              aria-label={`${weekLabels[p.i]}: ${formatAxisValue(p.v, valueSuffix)}`}
              onMouseEnter={() => setActiveIndex(p.i)}
              onFocus={() => setActiveIndex(p.i)}
            />
          ))}
        </div>

        {activeIndex !== null ? (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="pointer-events-none absolute z-10 rounded-lg border-0 bg-foreground px-2.5 py-1.5 text-background shadow-xl"
            style={{
              left: `clamp(0.5rem, ${pts[activeIndex]!.xPct}%, calc(100% - 5.5rem))`,
              top: `${Math.max(pts[activeIndex]!.yPct - 14, 6)}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <p className="text-[10px] font-medium opacity-80">{weekLabels[activeIndex]}</p>
            <p className="text-sm font-bold tabular-nums">
              {formatAxisValue(activeValue, valueSuffix)}
            </p>
          </motion.div>
        ) : null}
      </div>

      <div className={cn("mt-1.5 flex justify-between gap-1 px-1", dashChartLabel)}>
        {pts
          .filter((p) => p.i === 0 || p.i === pts.length - 1 || p.i % 2 === 0)
          .map((p) => (
            <span key={p.i} className={activeIndex === p.i ? "text-orange-600" : undefined}>
              {weekLabels[p.i]?.replace(" ago", "")}
            </span>
          ))}
      </div>
    </motion.div>
  );
}
