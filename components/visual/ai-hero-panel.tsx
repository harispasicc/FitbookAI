import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
export function AiHeroPanel({ className }: {
    className?: string;
}) {
    return (<div className={cn("relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-teal-500/10 via-background to-orange-500/10 p-6 shadow-inner", className)}>
      <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-teal-400/20 blur-3xl"/>
      <div className="pointer-events-none absolute -bottom-10 -left-10 size-44 rounded-full bg-orange-400/15 blur-3xl"/>
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Sparkles className="size-4" aria-hidden/>
          </span>
          FitBook AI
        </div>
        <svg viewBox="0 0 280 120" className="w-full text-teal-600/40" aria-hidden>
          <defs>
            <linearGradient id="ai-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.2"/>
              <stop offset="50%" stopColor="currentColor" stopOpacity="0.9"/>
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.2"/>
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map((i) => (<line key={i} x1={20 + i * 55} y1={100 - i * 14} x2={70 + i * 55} y2={30 + i * 8} stroke="url(#ai-line)" strokeWidth={2} strokeLinecap="round"/>))}
          {[0, 1, 2, 3].map((i) => (<circle key={i} cx={40 + i * 70} cy={55 + (i % 2) * 25} r={5} className="fill-orange-500/70"/>))}
        </svg>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Scheduling, reminders, and client answers — grounded in your calendar and roster.
        </p>
      </div>
    </div>);
}
