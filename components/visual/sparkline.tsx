import { cn } from "@/lib/utils";
type SparklineProps = {
    values: readonly number[];
    className?: string;
    strokeClassName?: string;
    fillStopClass?: string;
    gradientId?: string;
};
export function Sparkline({ values, className, strokeClassName = "stroke-teal-600", fillStopClass = "fill-teal-600", gradientId = "spark-fill", }: SparklineProps) {
    const w = 140;
    const h = 40;
    const pad = 2;
    const series = values.length < 2 ? [...values, values[0] ?? 0] : values;
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const points = series.map((v, i) => {
        const x = pad + (i / Math.max(series.length - 1, 1)) * (w - pad * 2);
        const y = pad + (1 - (v - min) / range) * (h - pad * 2);
        return [x, y] as const;
    });
    const lineD = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
    const areaD = `${lineD} L ${points[points.length - 1]![0]} ${h - pad} L ${points[0]![0]} ${h - pad} Z`;
    return (<svg viewBox={`0 0 ${w} ${h}`} className={cn("h-auto w-full max-w-[9rem]", className)} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className={fillStopClass} stopColor="currentColor" stopOpacity="0.28"/>
          <stop offset="100%" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradientId})`}/>
      <path d={lineD} fill="none" className={cn(strokeClassName)} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>);
}
