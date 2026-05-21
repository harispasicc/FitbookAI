import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CalendarCheck, ChevronRight, Dumbbell, LineChart, Search, TrendingUp, UserRound, Users, } from "lucide-react";
import { cn } from "@/lib/utils";
function StepCard({ step, title, body, icon: Icon, className, }: {
    step: string;
    title: string;
    body: string;
    icon: LucideIcon;
    className?: string;
}) {
    return (<div className={cn("flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-shadow hover:shadow-md", className)}>
      <span className="text-xs font-semibold uppercase tracking-wide text-primary">{step}</span>
      <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-muted/40 text-primary">
        <Icon className="size-5" aria-hidden/>
      </div>
      <div>
        <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>);
}
function MiniFlowCard({ label, icon: Icon, }: {
    label: string;
    icon: LucideIcon;
}) {
    return (<div className="flex min-w-[7.5rem] flex-1 flex-col items-center gap-2 rounded-xl border border-border/80 bg-card px-3 py-4 text-center shadow-sm">
      <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden/>
      </span>
      <span className="text-xs font-medium leading-snug text-foreground">{label}</span>
    </div>);
}
export function HowItWorksContent() {
    return (<div className="min-w-0">
      
      <section className="border-b border-border/60 bg-gradient-to-b from-muted/40 via-background to-background">
        <div className="mx-auto max-w-6xl px-3 py-14 min-[400px]:px-4 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-[2.5rem] md:leading-tight">
              Find a coach, book sessions, and track your progress in one place.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              FitBook connects clients with coaches while giving coaches modern tools for scheduling, AI reminders, and
              client management.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
              <Link href="/coaches" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
                Find coaches
              </Link>
              <Link href="/trainer/login" className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium shadow-sm transition-colors hover:bg-muted/60">
                Coach sign in
              </Link>
            </div>
          </div>

          
          <div className="mx-auto mt-14 max-w-4xl">
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Your journey
            </p>
            <div className="flex flex-wrap items-stretch justify-center gap-2 sm:gap-1 md:flex-nowrap">
              <MiniFlowCard label="Find coach" icon={Search}/>
              <span className="hidden items-center px-1 text-muted-foreground/50 md:flex" aria-hidden>
                <ChevronRight className="size-5"/>
              </span>
              <MiniFlowCard label="Book session" icon={CalendarCheck}/>
              <span className="hidden items-center px-1 text-muted-foreground/50 md:flex" aria-hidden>
                <ChevronRight className="size-5"/>
              </span>
              <MiniFlowCard label="Train" icon={Dumbbell}/>
              <span className="hidden items-center px-1 text-muted-foreground/50 md:flex" aria-hidden>
                <ChevronRight className="size-5"/>
              </span>
              <MiniFlowCard label="Track progress" icon={LineChart}/>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-3 py-14 min-[400px]:px-4 sm:px-6 sm:py-20 md:space-y-20 md:py-24">
        
        <section className="min-w-0">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">For clients</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Three simple steps</h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              From discovery to progress, without wading through pricing jargon.
            </p>
          </div>
          <div className="grid min-w-0 gap-4 md:grid-cols-3 md:gap-6">
            <StepCard step="Step 1" title="Find a coach" body="Browse coaches by style, specialty, pricing, and availability." icon={Search}/>
            <StepCard step="Step 2" title="Book sessions" body="Choose a package or session and book directly from the coach profile." icon={CalendarCheck}/>
            <StepCard step="Step 3" title="Track your progress" body="View workouts, progress, reminders, and upcoming sessions from your dashboard." icon={LineChart}/>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
              Create client account
            </Link>
            <Link href="/coaches" className="inline-flex h-10 items-center text-sm font-medium text-primary underline-offset-4 hover:underline">
              Browse directory
            </Link>
          </div>
        </section>

        
        <section className="min-w-0 rounded-2xl border border-border/80 bg-muted/15 p-6 sm:p-8 md:p-10">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">For coaches</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Run your practice on one platform</h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Everything you need to stay organized and look professional to clients.
            </p>
          </div>
          <div className="grid min-w-0 gap-4 md:grid-cols-3 md:gap-6">
            <StepCard step="Step 1" title="Create your coaching profile" body="Show your services, pricing, specialties, and availability." icon={UserRound}/>
            <StepCard step="Step 2" title="Manage your clients" body="Use calendar tools, reminders, analytics, and AI features." icon={Users}/>
            <StepCard step="Step 3" title="Grow your coaching business" body="Accept bookings, organize sessions, and manage your coaching workflow in one platform." icon={TrendingUp}/>
          </div>
          <div className="mt-8 flex flex-col gap-3 border-t border-border/60 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/coach/pricing" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              View coach software plans
              <ArrowRight className="size-4" aria-hidden/>
            </Link>
            <Link href="/trainer/login" className="text-sm font-medium text-foreground underline-offset-2 hover:underline sm:text-end">
              Coach sign in
            </Link>
          </div>
        </section>
      </div>
    </div>);
}
