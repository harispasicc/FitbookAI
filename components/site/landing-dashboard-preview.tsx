import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { AreaTrendChart, WeeklyBarsChart } from "@/components/visual/fitness-charts";
import { Sparkline } from "@/components/visual/sparkline";
import { fitnessImages } from "@/lib/media-urls";
export function LandingDashboardPreview({ idPrefix = "lp" }: {
    idPrefix?: string;
}) {
    const p = idPrefix;
    return (<div className="relative min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-xl shadow-black/10 ring-1 ring-black/[0.04] backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-500/[0.07] via-transparent to-orange-500/[0.08]"/>
      <div className="relative min-w-0 p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">Coach OS preview</span>
          <span className="rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            Sample data
          </span>
        </div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-3">
          {[
            { label: "Revenue (30d)", value: "$12.5k", series: [8, 9, 8.5, 10, 11, 10.2, 11.4, 12.1], stroke: "stroke-teal-600", gid: `${p}-sp-1` },
            { label: "Bookings", value: "186", series: [22, 24, 21, 28, 26, 30, 29, 31], stroke: "stroke-orange-500", gid: `${p}-sp-2` },
            { label: "Retention", value: "88%", series: [82, 83, 84, 85, 86, 87, 87.5, 88], stroke: "stroke-teal-500", gid: `${p}-sp-3` },
        ].map((k) => (<div key={k.label} className="rounded-2xl border border-border/70 bg-background/80 p-3 shadow-sm backdrop-blur-sm">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{k.label}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight">{k.value}</p>
              <div className="mt-2 flex justify-end opacity-90">
                <Sparkline values={k.series} strokeClassName={k.stroke} gradientId={k.gid}/>
              </div>
            </div>))}
        </div>
        <div className="mt-3 grid min-w-0 gap-3 lg:grid-cols-5">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-muted/20 lg:col-span-2">
            <Image src={fitnessImages.heroCoach} alt="Coach reviewing session notes with a client" width={640} height={400} className="h-36 w-full object-cover sm:h-44" sizes="(max-width: 1024px) 100vw, 40vw" priority/>
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"/>
            <p className="absolute bottom-2 left-3 right-3 text-xs font-medium text-foreground drop-shadow-sm">
              Real coaching workflows — bookings, clients, and AI in one surface.
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/80 p-3 shadow-sm backdrop-blur-sm lg:col-span-3">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Sessions · this week</span>
              <CalendarDays className="size-3.5 opacity-70" aria-hidden/>
            </div>
            <div className="h-28 rounded-xl border border-border/60 bg-muted/15 p-1">
              <WeeklyBarsChart values={[38, 52, 44, 61, 48, 33, 41]} barClassName="fill-orange-500/75"/>
            </div>
            <div className="mt-2 h-20 rounded-xl border border-border/60 bg-muted/10 p-1">
              <AreaTrendChart values={[10, 12, 11, 15, 14, 17, 18, 20]} fillGradientId={`${p}-area`}/>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
