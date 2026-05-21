"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Activity, ArrowRight, BarChart3, Bell, CalendarDays, Sparkles, Target, Users, } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: 0.06 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
    }),
};
type Bullet = {
    text: string;
    icon: LucideIcon;
};
const clientBullets: Bullet[] = [
    { text: "Find coaches that match your goals", icon: Target },
    { text: "Book sessions online", icon: CalendarDays },
    { text: "Track workouts and progress", icon: Activity },
    { text: "Stay consistent with reminders", icon: Bell },
];
const coachBullets: Bullet[] = [
    { text: "Manage bookings and schedules", icon: CalendarDays },
    { text: "Organize clients in one dashboard", icon: Users },
    { text: "Use AI-powered coaching tools", icon: Sparkles },
    { text: "Grow your coaching business", icon: BarChart3 },
];
function MiniClientPeek() {
    return (<div className="relative overflow-hidden rounded-xl border border-border/80 bg-gradient-to-br from-muted/50 via-background/80 to-background p-3 shadow-inner">
      <div className="absolute -right-6 -top-6 size-24 rounded-full bg-primary/[0.07] blur-2xl" aria-hidden/>
      <div className="relative flex gap-2">
        <div className="h-14 flex-1 rounded-lg border border-border/60 bg-card/90 p-2 shadow-sm backdrop-blur-sm">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">This week</p>
          <p className="mt-1 text-sm font-semibold tabular-nums">3 sessions</p>
        </div>
        <div className="h-14 flex-1 rounded-lg border border-border/60 bg-card/90 p-2 shadow-sm backdrop-blur-sm">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Goals</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-2/3 rounded-full bg-primary/80"/>
          </div>
        </div>
      </div>
    </div>);
}
function MiniCoachPeek() {
    return (<div className="relative overflow-hidden rounded-xl border border-border/80 bg-gradient-to-br from-muted/50 via-background/80 to-background p-3 shadow-inner">
      <div className="absolute -left-4 -bottom-8 size-28 rounded-full bg-primary/[0.08] blur-2xl" aria-hidden/>
      <div className="relative grid grid-cols-3 gap-1.5">
        {["Booked", "Clients", "AI"].map((label, i) => (<div key={label} className="rounded-lg border border-border/60 bg-card/90 px-2 py-2 text-center shadow-sm backdrop-blur-sm">
            <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-xs font-semibold tabular-nums text-foreground">{["12", "28", "4"][i]}</p>
          </div>))}
      </div>
    </div>);
}
type AudienceCardProps = {
    title: string;
    description: string;
    bullets: Bullet[];
    peek: ReactNode;
    primary: {
        href: string;
        label: string;
    };
    secondary: {
        href: string;
        label: string;
    };
    variant: "client" | "coach";
};
function AudienceCard({ title, description, bullets, peek, primary, secondary, variant }: AudienceCardProps) {
    return (<motion.div variants={fadeUp} custom={variant === "client" ? 1 : 2} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} className={cn("group relative flex min-h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-[box-shadow,transform,border-color] duration-200 sm:p-8", "hover:-translate-y-0.5 hover:border-border hover:shadow-md")}>
      <div className={cn("pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100", variant === "client"
            ? "bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent"
            : "bg-gradient-to-bl from-primary/[0.06] via-transparent to-transparent")} aria-hidden/>
      <div className="relative space-y-5">
        <div>
          <h3 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">{description}</p>
        </div>
        {peek}
        <ul className="space-y-3">
          {bullets.map(({ text, icon: Icon }) => (<li key={text} className="flex gap-3 text-sm text-muted-foreground">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground transition-colors group-hover:bg-muted/60">
                <Icon className="size-3.5" aria-hidden/>
              </span>
              <span className="min-w-0 pt-1 leading-snug text-foreground/90">{text}</span>
            </li>))}
        </ul>
        <div className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:flex-wrap">
          <Link href={primary.href} className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
            {primary.label}
          </Link>
          <Link href={secondary.href} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-background/80 px-5 text-sm font-medium text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-muted/60">
            {secondary.label}
            <ArrowRight className="size-3.5 opacity-70" aria-hidden/>
          </Link>
        </div>
      </div>
    </motion.div>);
}
export function LandingPlatformSection() {
    return (<section id="platform" className="bg-muted/20 py-12 sm:py-20">
      <div className="mx-auto min-w-0 max-w-6xl px-3 min-[400px]:px-4 sm:px-6">
        <motion.div className="mb-10 max-w-2xl space-y-3 sm:mb-12" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-20px" }} variants={fadeUp} custom={0}>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">The product</p>
          <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            One platform. Two experiences.
          </h2>
          <p className="text-pretty text-muted-foreground sm:text-lg">
            FitBook keeps training organized for people who show up and for coaches who run the whole day behind the
            scenes. Same calm design language, tailored to how each side works.
          </p>
        </motion.div>

        <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-8">
          <AudienceCard variant="client" title="For clients" description="Discover coaches, book sessions that fit your life, and keep momentum with a dashboard built around your goals, not admin noise." bullets={clientBullets} peek={<MiniClientPeek />} primary={{ href: "/coaches", label: "Find coaches" }} secondary={{ href: "/login", label: "Client sign in" }}/>
          <AudienceCard variant="coach" title="For coaches" description="Run bookings, client notes, and AI-assisted workflows from one surface so you spend less time juggling tools and more time coaching." bullets={coachBullets} peek={<MiniCoachPeek />} primary={{ href: "/signup?intent=trainer", label: "Start coaching with FitBook" }} secondary={{ href: "/coach/pricing", label: "View coach plans" }}/>
        </div>

        <motion.p className="mt-8 text-center text-xs text-muted-foreground sm:mt-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.4 }}>
          Already with us?{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-2 hover:underline">
            Client sign in
          </Link>
          {" · "}
          <Link href="/trainer/login" className="font-medium text-foreground underline-offset-2 hover:underline">
            Coach sign in
          </Link>
        </motion.p>
      </div>
    </section>);
}
