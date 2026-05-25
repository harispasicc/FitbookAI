import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Bell, Bot, CalendarDays, LayoutGrid, MessageSquare, Sparkles, Users, } from "lucide-react";
import { BrandLogoLink } from "@/components/site/brand-logo-link";
import { SiteHeaderNav } from "@/components/site/site-header-nav";
import { LandingDashboardPreview } from "@/components/site/landing-dashboard-preview";
import { LandingPlatformSection } from "@/components/site/landing-platform-section";
import { LandingTestimonials } from "@/components/site/landing-testimonials";
import { SiteFooter } from "@/components/site/site-footer";
import { fitnessImages, trainerAvatarUrls } from "@/lib/media-urls";
import { landingSocialProofStats } from "@/lib/landing-preview-metrics";
import { GUEST_NAV_LINKS } from "@/lib/site-nav";
const features = [
    { title: "Smart booking", desc: "Availability-aware scheduling without spreadsheet chaos.", icon: CalendarDays },
    { title: "AI assistant", desc: "Draft reminders, suggest slots, and answer routine questions.", icon: Sparkles },
    { title: "Client management", desc: "Goals, notes, and session history in one calm view.", icon: Users },
    { title: "Analytics", desc: "Bookings, revenue, retention: the metrics that matter.", icon: BarChart3 },
    { title: "Availability calendar", desc: "Daily and weekly views built for real-world gyms.", icon: LayoutGrid },
    { title: "Automated reminders", desc: "Reduce no-shows with timely, human-sounding messages.", icon: Bell },
];
export function LandingPage() {
    return (<div className="min-h-screen min-w-0 bg-background text-foreground">
      <header className="sticky top-0 z-[100] border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl min-h-[5.25rem] items-center gap-3 px-4 py-2 sm:min-h-28 sm:gap-4 sm:px-6 sm:py-3">
          <BrandLogoLink size="nav"/>
          <SiteHeaderNav links={GUEST_NAV_LINKS}/>
        </div>
      </header>

      <main>
        <section className="mx-auto grid min-w-0 max-w-6xl gap-8 px-3 py-12 min-[400px]:px-4 sm:gap-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
          <div className="min-w-0 space-y-5 sm:space-y-6 [&_a]:touch-manipulation">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Book coaches · track progress
            </p>
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Find your coach, book smarter, track your progress
            </h1>
            <p className="max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              Browse coaches by style: yoga, strength, cardio, CrossFit, definition, and more. AI helps you pick
              slots that fit your coach&apos;s calendar, and your dashboard keeps sessions and progress in one place.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex -space-x-2">
                {trainerAvatarUrls.slice(0, 4).map((src, i) => (<Image key={`trainer-avatar-${i}`} src={src} alt="" width={40} height={40} className="size-10 rounded-full border-2 border-background object-cover shadow-sm" sizes="40px"/>))}
              </div>
              <p className="text-xs text-muted-foreground">
                Real coaches you can filter by goal. Try demo profiles to explore the experience.
              </p>
            </div>
            <div className="relative min-w-0 overflow-hidden rounded-2xl border border-border/80 shadow-md">
              <Image src={fitnessImages.heroGym} alt="Training floor with equipment" width={900} height={360} className="aspect-[21/9] w-full object-cover" sizes="(max-width: 1024px) 100vw, 50vw"/>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/90 via-background/25 to-transparent"/>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/coaches" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
                Find coaches
              </Link>
              <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium shadow-sm transition-colors hover:bg-muted/60">
                Client sign in
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Demo mode with pre-seeded accounts.{" "}
              <Link href="/login" className="font-medium text-primary underline-offset-2 hover:underline">
                Try client demo
              </Link>
              {" · "}
              <Link
                href="/trainer/login"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                Coach demo
              </Link>
            </p>
          </div>
          <LandingDashboardPreview
            idPrefix="hero"
            photoSrc={fitnessImages.heroSession}
            photoAlt="Coach leading a small group session"
          />
        </section>

        <section className="border-y border-border/80 bg-muted/25 py-10 sm:py-12">
          <div className="mx-auto min-w-0 max-w-6xl space-y-3 px-3 min-[400px]:px-4 sm:px-6">
            <p className="text-center text-[11px] font-medium text-muted-foreground/90">
              Illustrative benchmarks from demo workspaces — not live platform totals
            </p>
            <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
              {landingSocialProofStats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-3xl font-semibold tabular-nums tracking-tight">{s.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto min-w-0 max-w-6xl space-y-8 px-3 py-12 min-[400px]:px-4 sm:space-y-10 sm:px-6 sm:py-20">
          <div className="min-w-0 max-w-2xl space-y-3">
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">Built for busy coaches</h2>
            <p className="text-muted-foreground">
              A focused surface area: fewer tabs, more clarity, and room to breathe.
            </p>
          </div>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ title, desc, icon: Icon }) => (<div key={title} className="flex min-w-0 flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
                <div className="mb-3 flex size-9 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground">
                  <Icon className="size-4" aria-hidden/>
                </div>
                <h3 className="font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>))}
          </div>
        </section>

        <section className="border-y border-border/80 bg-muted/20 py-12 sm:py-20">
          <div className="mx-auto min-w-0 max-w-6xl px-3 min-[400px]:px-4 sm:px-6">
            <div className="mb-8 max-w-2xl space-y-3 sm:mb-10">
              <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard preview</h2>
              <p className="text-muted-foreground">
                Calm cards, tight typography, and whitespace that lets numbers speak.
              </p>
            </div>
            <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:items-stretch">
              <div className="relative min-h-[200px] overflow-hidden rounded-2xl border border-border/80 shadow-xl shadow-black/10 sm:min-h-[220px]">
                <Image src={fitnessImages.coachClipboard} alt="Coach planning sessions" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw"/>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"/>
                <p className="absolute bottom-4 left-4 right-4 max-w-sm text-sm font-medium text-foreground drop-shadow">
                  KPIs, retention, and revenue tuned for boutique studios and solo pros.
                </p>
              </div>
              <LandingDashboardPreview idPrefix="mid"/>
            </div>
          </div>
        </section>

        <section className="mx-auto min-w-0 max-w-6xl px-3 py-12 min-[400px]:px-4 sm:px-6 sm:py-20">
          <div className="mb-8 max-w-2xl space-y-3 sm:mb-10">
            <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">AI that feels practical</h2>
            <p className="text-muted-foreground">
              Not neon sci-fi. A simple chat surface coaches can trust day to day.
            </p>
          </div>
          <div className="mx-auto mb-6 max-w-2xl overflow-hidden rounded-2xl border border-border/80 shadow-md">
            <Image src={fitnessImages.stretch} alt="Athlete stretching before a coached session" width={960} height={320} className="aspect-[3/1] w-full object-cover" sizes="(max-width: 768px) 100vw, 42rem"/>
          </div>
          <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card/95 p-4 shadow-lg shadow-black/5 backdrop-blur-sm sm:p-6">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium">
              <Bot className="size-4 text-muted-foreground" aria-hidden/>
              FitBook AI
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg rounded-tl-sm border border-border bg-muted/40 px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground">You</p>
                <p>Find me a free slot tomorrow after 5pm.</p>
              </div>
              <div className="rounded-lg rounded-tr-sm border border-border bg-background px-3 py-2 shadow-sm">
                <p className="text-xs font-medium text-muted-foreground">AI</p>
                <p>You have availability at <span className="font-medium">5:30 PM</span> and{" "}
                  <span className="font-medium">7:00 PM</span>.
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <div className="flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                <MessageSquare className="size-3.5 shrink-0" aria-hidden/>
                <span className="min-w-0 truncate sm:whitespace-normal">Ask anything about your schedule…</span>
              </div>
              <span className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground touch-manipulation">
                Send
              </span>
            </div>
          </div>
        </section>

        <LandingTestimonials />

        <LandingPlatformSection />

        <section className="mx-auto min-w-0 max-w-6xl px-3 py-12 min-[400px]:px-4 sm:px-6 sm:py-20">
          <div className="flex flex-col items-start justify-between gap-6 rounded-xl border border-border bg-card p-5 shadow-sm min-[480px]:p-8 sm:flex-row sm:items-center">
            <div className="min-w-0 space-y-2">
              <h2 className="text-balance text-xl font-semibold tracking-tight min-[480px]:text-2xl">
                Ready to find your coach?
              </h2>
              <p className="text-sm text-muted-foreground">
                Browse the directory, then create a client account when you&apos;re ready to book.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 min-[480px]:flex-row">
              <Link href="/coaches" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
                Find coaches
                <ArrowRight className="size-4" aria-hidden/>
              </Link>
              <Link href="/signup" className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-medium shadow-sm transition-colors hover:bg-muted/60">
                Create account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>);
}
