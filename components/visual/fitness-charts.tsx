import { cn } from "@/lib/utils";
const days = ["M", "T", "W", "T", "F", "S", "S"];
type WeeklyBarsProps = {
    values: number[];
    className?: string;
    barClassName?: string;
};
export function WeeklyBarsChart({ values, className, barClassName = "fill-teal-500/80" }: WeeklyBarsProps) {
    const w = 320;
    const h = 120;
    const pad = { l: 8, r: 8, t: 12, b: 22 };
    const innerW = w - pad.l - pad.r;
    const innerH = h - pad.t - pad.b;
    const max = Math.max(...values, 1);
    const barW = innerW / values.length - 4;
    return (<svg viewBox={`0 0 ${w} ${h}`} className={cn("h-full w-full max-w-full", className)} aria-hidden>
      {values.map((v, i) => {
            const bh = (v / max) * innerH;
            const x = pad.l + i * (innerW / values.length) + 2;
            const y = pad.t + innerH - bh;
            return (<g key={i}>
            <rect x={x} y={y} width={barW} height={bh} rx={6} className={cn(barClassName)}/>
            <text x={x + barW / 2} y={h - 6} textAnchor="middle" className="fill-zinc-500 text-[10px] font-medium">
              {days[i]}
            </text>
          </g>);
        })}
    </svg>);
}
type AreaTrendProps = {
    values: number[];
    className?: string;
    strokeClassName?: string;
    fillGradientId?: string;
};
export function AreaTrendChart({ values, className, strokeClassName = "stroke-orange-500", fillGradientId = "area-orange-fill", }: AreaTrendProps) {
    const w = 400;
    const h = 160;
    const pad = 8;
    const series = values.length < 2 ? [...values, values[0] ?? 0] : values;
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const pts = series.map((v, i) => {
        const x = pad + (i / Math.max(series.length - 1, 1)) * (w - pad * 2);
        const y = pad + (1 - (v - min) / range) * (h - pad * 2);
        return [x, y] as const;
    });
    const lineD = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
    const areaD = `${lineD} L ${pts[pts.length - 1]![0]} ${h - pad} L ${pts[0]![0]} ${h - pad} Z`;
    return (<svg viewBox={`0 0 ${w} ${h}`} className={cn("h-full w-full max-w-full", className)} aria-hidden>
      <defs>
        <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="fill-orange-400" stopOpacity="0.25"/>
          <stop offset="100%" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${fillGradientId})`}/>
      <path d={lineD} fill="none" className={cn(strokeClassName)} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>);
}
type DonutProps = {
    pct: number;
    className?: string;
    trackClass?: string;
    arcClass?: string;
};
export function DonutKpi({ pct, className, trackClass = "stroke-muted/40", arcClass = "stroke-teal-500" }: DonutProps) {
    const r = 36;
    const c = 2 * Math.PI * r;
    const offset = c - (pct / 100) * c;
    return (<svg viewBox="0 0 96 96" className={cn("size-20 shrink-0", className)} aria-hidden>
      <circle cx="48" cy="48" r={r} fill="none" className={cn(trackClass)} strokeWidth="10"/>
      <circle cx="48" cy="48" r={r} fill="none" className={arcClass} strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} transform="rotate(-90 48 48)"/>
      <text x="48" y="52" textAnchor="middle" className="fill-zinc-900 text-sm font-semibold">
        {pct}%
      </text>
    </svg>);
}
