import { cn } from "@/lib/utils";

const weekdays = ["M", "T", "W", "T", "F", "S", "S"];
const weekdayFull = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function buildIntYTicks(max: number): number[] {
  const ceiling = Math.max(Math.ceil(max), 1);
  if (ceiling <= 4) {
    return Array.from({ length: ceiling + 1 }, (_, i) => i);
  }
  const step = Math.max(1, Math.ceil(ceiling / 4));
  const ticks: number[] = [0];
  for (let t = step; t < ceiling; t += step) ticks.push(t);
  if (ticks[ticks.length - 1] !== ceiling) ticks.push(ceiling);
  return ticks;
}

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

type WeeklyBarsProps = {
  values: number[];
  className?: string;
  barClassName?: string;
};

export function WeeklyBarsChart({
  values,
  className,
  barClassName = "fill-teal-500/80",
}: WeeklyBarsProps) {
  const w = 320;
  const h = 120;
  const pad = { l: 8, r: 8, t: 12, b: 22 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const max = Math.max(...values, 1);
  const barW = innerW / values.length - 4;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-full w-full max-w-full", className)}
      aria-hidden
    >
      {values.map((v, i) => {
        const bh = (v / max) * innerH;
        const x = pad.l + i * (innerW / values.length) + 2;
        const y = pad.t + innerH - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx={6} className={cn(barClassName)} />
            <text
              x={x + barW / 2}
              y={h - 6}
              textAnchor="middle"
              className="fill-zinc-500 text-[10px] font-medium dark:fill-zinc-400"
            >
              {weekdays[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

type AreaTrendProps = {
  values: number[];
  className?: string;
  strokeClassName?: string;
  fillGradientId?: string;
  valueSuffix?: string;
};

export function AreaTrendChart({
  values,
  className,
  strokeClassName = "stroke-orange-500",
  fillGradientId = "area-orange-fill",
  valueSuffix = "€",
}: AreaTrendProps) {
  const w = 420;
  const h = 176;
  const pad = { l: 40, r: 14, t: 18, b: 32 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const series = values.length < 2 ? [...values, values[0] ?? 0] : values;
  const max = Math.max(...series, 0.01);
  const ticks = buildYTicks(max);

  const pts = series.map((v, i) => {
    const x = pad.l + (i / Math.max(series.length - 1, 1)) * innerW;
    const y = pad.t + innerH - (v / max) * innerH;
    return [x, y] as const;
  });

  const lineD = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");
  const areaD = `${lineD} L ${pts[pts.length - 1]![0]} ${pad.t + innerH} L ${pts[0]![0]} ${pad.t + innerH} Z`;

  const weekLabels =
    series.length <= 1
      ? ["Now"]
      : series.map((_, i) => {
          if (i === series.length - 1) return "Now";
          const weeksAgo = series.length - 1 - i;
          return weeksAgo === 1 ? "1w" : `${weeksAgo}w`;
        });

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-full w-full max-w-full", className)}
      role="img"
      aria-label="Revenue trend chart"
    >
      <defs>
        <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="fill-orange-400" stopOpacity="0.35" />
          <stop offset="100%" stopOpacity="0" />
        </linearGradient>
      </defs>

      {ticks.map((tick, tickIndex) => {
        const y = pad.t + innerH - (tick / max) * innerH;
        return (
          <g key={`y-tick-${tickIndex}-${tick}`}>
            <line
              x1={pad.l}
              y1={y}
              x2={w - pad.r}
              y2={y}
              className="stroke-border/70"
              strokeWidth={1}
              strokeDasharray={tick === 0 ? undefined : "4 4"}
            />
            <text
              x={pad.l - 6}
              y={y + 4}
              textAnchor="end"
              className="fill-muted-foreground text-[10px] tabular-nums"
            >
              {formatAxisValue(tick, valueSuffix)}
            </text>
          </g>
        );
      })}

      <path d={areaD} fill={`url(#${fillGradientId})`} />
      <path
        d={lineD}
        fill="none"
        className={cn(strokeClassName)}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {pts.map(([x, y], i) => {
        const showLabel =
          series.length <= 6 || i === 0 || i === series.length - 1 || i % 2 === 0;
        return (
          <g key={`point-${i}`}>
            <circle
              cx={x}
              cy={y}
              r={4}
              className="fill-background stroke-orange-500"
              strokeWidth={2}
            />
            {showLabel ? (
              <text
                x={x}
                y={h - 10}
                textAnchor="middle"
                className="fill-muted-foreground text-[9px] font-medium"
              >
                {weekLabels[i]}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

type MiniBarsProps = {
  values: readonly number[];
  className?: string;
  barClassName?: string;
};

export function MiniBarSpark({
  values,
  className,
  barClassName = "fill-orange-500/85",
}: MiniBarsProps) {
  const w = 88;
  const h = 36;
  const pad = { l: 2, r: 2, t: 4, b: 2 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const series = values.length < 2 ? [...values, values[0] ?? 0] : values;
  const max = Math.max(...series, 1);
  const gap = 2;
  const barW = (innerW - gap * (series.length - 1)) / series.length;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-9 w-full max-w-[6.5rem]", className)}
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      {series.map((v, i) => {
        const bh = Math.max((v / max) * innerH, v > 0 ? 3 : 1);
        const x = pad.l + i * (barW + gap);
        const y = pad.t + innerH - bh;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={bh}
            rx={2}
            className={cn(barClassName, v === 0 && "opacity-35")}
          />
        );
      })}
    </svg>
  );
}

type DonutProps = {
  pct: number;
  className?: string;
  trackClass?: string;
  arcClass?: string;
  size?: "sm" | "md";
};

export function DonutKpi({
  pct,
  className,
  trackClass = "stroke-muted/40",
  arcClass = "stroke-teal-500",
  size = "md",
}: DonutProps) {
  const dim = size === "sm" ? 56 : 96;
  const r = size === "sm" ? 20 : 36;
  const cx = dim / 2;
  const stroke = size === "sm" ? 6 : 10;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const fontSize = size === "sm" ? "text-[10px]" : "text-sm";

  return (
    <svg
      viewBox={`0 0 ${dim} ${dim}`}
      className={cn(size === "sm" ? "size-14" : "size-20", "shrink-0", className)}
      aria-hidden
    >
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        className={cn(trackClass)}
        strokeWidth={stroke}
      />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        className={cn(arcClass)}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cx})`}
      />
      <text
        x={cx}
        y={cx + (size === "sm" ? 3 : 4)}
        textAnchor="middle"
        className={cn("fill-foreground font-semibold tabular-nums", fontSize)}
      >
        {pct}%
      </text>
    </svg>
  );
}

export type ClientLoadSegment = {
  label: string;
  value: number;
  colorClass: string;
  dotClass: string;
};

type ClientLoadChartProps = {
  segments: ClientLoadSegment[];
  className?: string;
};

export function ClientLoadChart({ segments, className }: ClientLoadChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const safeTotal = Math.max(total, 1);

  const r = 52;
  const c = 2 * Math.PI * r;
  let offset = 0;

  const arcs = segments.map((s) => {
    const pct = s.value / safeTotal;
    const dash = pct * c;
    const arc = {
      ...s,
      pct: Math.round(pct * 100),
      dash,
      gap: c - dash,
      rotation: (offset / c) * 360 - 90,
    };
    offset += dash;
    return arc;
  });

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-8",
        className,
      )}
    >
      <div className="relative shrink-0">
        <svg viewBox="0 0 128 128" className="size-28 sm:size-32" aria-hidden>
          <circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            className="stroke-muted/30"
            strokeWidth="14"
          />
          {total === 0 ? (
            <circle
              cx="64"
              cy="64"
              r={r}
              fill="none"
              className="stroke-muted/50"
              strokeWidth="14"
              strokeDasharray="4 8"
            />
          ) : (
            arcs.map((a) =>
              a.value > 0 ? (
                <circle
                  key={a.label}
                  cx="64"
                  cy="64"
                  r={r}
                  fill="none"
                  className={a.colorClass}
                  strokeWidth="14"
                  strokeLinecap="butt"
                  strokeDasharray={`${a.dash} ${a.gap}`}
                  transform={`rotate(${a.rotation} 64 64)`}
                />
              ) : null,
            )
          )}
          <text
            x="64"
            y="60"
            textAnchor="middle"
            className="fill-foreground text-xl font-semibold tabular-nums"
          >
            {total}
          </text>
          <text
            x="64"
            y="76"
            textAnchor="middle"
            className="fill-muted-foreground text-[10px] font-medium"
          >
            clients
          </text>
        </svg>
      </div>

      <ul className="grid w-full min-w-0 flex-1 grid-cols-1 gap-2 sm:max-w-[14rem]">
        {segments.map((s) => {
          const pct = total === 0 ? 0 : Math.round((s.value / safeTotal) * 100);
          return (
            <li
              key={s.label}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className={cn("size-2.5 shrink-0 rounded-full", s.dotClass)} />
                <span className="text-sm font-medium text-foreground">{s.label}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums text-foreground">{s.value}</p>
                <p className="text-[11px] tabular-nums text-muted-foreground">{pct}%</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type PeakHoursProps = {
  buckets: { label: string; count: number }[];
  className?: string;
};

export function PeakHoursChart({ buckets, className }: PeakHoursProps) {
  const max = Math.max(...buckets.map((b) => b.count), 1);
  return (
    <div className={cn("space-y-3", className)}>
      {buckets.map((b) => (
        <div key={b.label} className="grid grid-cols-[3.25rem_1fr_2rem] items-center gap-2.5">
          <span className="text-xs font-medium text-muted-foreground">{b.label}</span>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500/90 to-teal-500/80 transition-all"
              style={{ width: `${Math.max((b.count / max) * 100, b.count > 0 ? 8 : 0)}%` }}
            />
          </div>
          <span className="text-right text-xs font-semibold tabular-nums text-foreground">
            {b.count}
          </span>
        </div>
      ))}
    </div>
  );
}

type GroupedBarsProps = {
  series: { label: string; values: number[]; barClass: string }[];
  className?: string;
};

type DashboardChartProps = {
  values: number[];
  className?: string;
  minHeightClass?: string;
};

export function SessionsCompletedChart({
  values,
  className,
  minHeightClass = "min-h-[11.25rem]",
}: DashboardChartProps) {
  const series = values.length > 0 ? values : [0];
  const len = series.length;
  const max = Math.max(...series, 1);
  const ticks = buildIntYTicks(max);
  const w = 440;
  const h = 200;
  const pad = { l: 36, r: 20, t: 14, b: 32 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const slotW = innerW / len;
  const barW = Math.max(slotW * 0.55, 6);

  return (
    <div className={cn("w-full", minHeightClass, className)}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-full w-full max-w-full"
        role="img"
        aria-label="Sessions completed per week"
      >
        {ticks.map((tick, tickIndex) => {
          const y = pad.t + innerH - (tick / max) * innerH;
          return (
            <g key={`y-${tickIndex}-${tick}`}>
              <line
                x1={pad.l}
                y1={y}
                x2={w - pad.r}
                y2={y}
                className="stroke-border/25"
                strokeWidth={1}
                strokeDasharray={tick === 0 ? undefined : "4 4"}
              />
              <text
                x={pad.l - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[11px] font-semibold tabular-nums opacity-90"
              >
                {tick}
              </text>
            </g>
          );
        })}
        {series.map((v, i) => {
          const bh = Math.max((v / max) * innerH, v > 0 ? 4 : 0);
          const x = pad.l + i * slotW + (slotW - barW) / 2;
          const y = pad.t + innerH - bh;
          const weeksAgo = len - 1 - i;
          const label = i === len - 1 ? "Now" : weeksAgo === 1 ? "1w" : `${weeksAgo}w`;
          return (
            <g key={`bar-${i}`}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={bh}
                rx={4}
                className="fill-teal-500/85"
              />
              <text
                x={x + barW / 2}
                y={h - 10}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px] font-semibold opacity-85"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function WeekdayBookingsChart({
  values,
  className,
  minHeightClass = "min-h-[11.25rem]",
}: DashboardChartProps) {
  const series =
    values.length === 7 ? values : [...values, ...Array(7).fill(0)].slice(0, 7);
  const max = Math.max(...series, 1);
  const peakIdx = series.indexOf(Math.max(...series));
  const ticks = buildIntYTicks(max);
  const w = 400;
  const h = 200;
  const pad = { l: 32, r: 16, t: 14, b: 36 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const slotW = innerW / 7;
  const barW = Math.max(slotW * 0.5, 8);

  return (
    <div className={cn("w-full", minHeightClass, className)}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-full w-full max-w-full"
        role="img"
        aria-label="Bookings by weekday"
      >
        {ticks.map((tick, tickIndex) => {
          const y = pad.t + innerH - (tick / max) * innerH;
          return (
            <g key={`wd-y-${tickIndex}-${tick}`}>
              <line
                x1={pad.l}
                y1={y}
                x2={w - pad.r}
                y2={y}
                className="stroke-border/25"
                strokeWidth={1}
                strokeDasharray={tick === 0 ? undefined : "4 4"}
              />
              <text
                x={pad.l - 6}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[11px] font-semibold tabular-nums opacity-90"
              >
                {tick}
              </text>
            </g>
          );
        })}
        {series.map((v, i) => {
          const bh = Math.max((v / max) * innerH, v > 0 ? 4 : 0);
          const x = pad.l + i * slotW + (slotW - barW) / 2;
          const y = pad.t + innerH - bh;
          const isPeak = i === peakIdx && v > 0;
          return (
            <g key={`wd-${i}`}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={bh}
                rx={4}
                className={cn(
                  isPeak ? "fill-orange-500" : "fill-orange-500/70",
                )}
              />
              <text
                x={x + barW / 2}
                y={h - 12}
                textAnchor="middle"
                className={cn(
                  "text-[11px] font-medium",
                  isPeak
                    ? "fill-orange-600 font-semibold"
                    : "fill-muted-foreground",
                )}
              >
                {weekdayFull[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function GroupedMiniBars({ series, className }: GroupedBarsProps) {
  const len = series[0]?.values.length ?? 0;
  const max = Math.max(...series.flatMap((s) => s.values), 1);
  const w = 280;
  const h = 100;
  const pad = { l: 8, r: 8, t: 8, b: 18 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const groupW = innerW / Math.max(len, 1);
  const barW = Math.max((groupW - 4) / series.length, 2);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("h-full w-full", className)} aria-hidden>
      {series[0]?.values.map((_, i) => (
        <text
          key={`lbl-${i}`}
          x={pad.l + i * groupW + groupW / 2}
          y={h - 4}
          textAnchor="middle"
          className="fill-muted-foreground text-[9px]"
        >
          {i === len - 1 ? "Now" : `${len - 1 - i}w`}
        </text>
      ))}
      {series.map((s, si) =>
        s.values.map((v, i) => {
          const bh = (v / max) * innerH;
          const x = pad.l + i * groupW + si * barW + 2;
          const y = pad.t + innerH - bh;
          return (
            <rect
              key={`${s.label}-${i}`}
              x={x}
              y={y}
              width={barW}
              height={Math.max(bh, v > 0 ? 2 : 0)}
              rx={2}
              className={s.barClass}
            />
          );
        }),
      )}
    </svg>
  );
}
