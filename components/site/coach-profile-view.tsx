"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Award, CalendarClock, Clock, MapPin, MessageCircle, Sparkles, Star, TrendingUp, Users, } from "lucide-react";
import type { MockTrainer } from "@/lib/mock-trainers";
import { trainerWeekdayRows } from "@/lib/mock-trainers";
import { trainerAvatarUrls } from "@/lib/media-urls";
import { TrainerBookingFlow } from "@/components/site/trainer-booking-flow";
import { TrainerProfileBookingCta } from "@/components/site/trainer-profile-booking-cta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
type CoachProfileViewProps = {
    trainer: MockTrainer;
};
const fade = {
    hidden: { opacity: 0, y: 12 },
    show: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: 0.05 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
    }),
};
export function CoachProfileView({ trainer }: CoachProfileViewProps) {
    const src = trainerAvatarUrls[trainer.avatarIndex % trainerAvatarUrls.length] ?? trainerAvatarUrls[0];
    const weekRows = trainerWeekdayRows(trainer);
    return (<div className="min-w-0 bg-background">
      <section className="border-b border-border/80 bg-gradient-to-b from-muted/40 via-background to-background">
        <div className="mx-auto max-w-6xl px-3 py-6 min-[400px]:px-4 sm:px-6 sm:py-8">
          <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/coaches" className="inline-flex items-center gap-1 font-medium hover:text-foreground">
              <ArrowLeft className="size-4" aria-hidden/>
              Find coaches
            </Link>
            <span className="mx-2 text-border">/</span>
            <span className="text-foreground">{trainer.name}</span>
          </nav>

          <div className="grid min-w-0 gap-8 lg:grid-cols-[1fr_20rem] lg:items-center lg:gap-12">
            <motion.div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start" initial="hidden" animate="show" custom={0} variants={fade}>
              <Image src={src} alt="" width={140} height={140} className="size-32 shrink-0 rounded-2xl border border-border/80 object-cover shadow-md sm:size-36" sizes="144px" priority/>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-4xl">{trainer.name}</h1>
                  <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {trainer.deliveryModes.includes("hybrid")
            ? "Hybrid"
            : trainer.deliveryModes.includes("online")
                ? "Online"
                : "In person"}
                  </span>
                </div>
                <p className="text-base text-muted-foreground sm:text-lg">{trainer.headline}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <Star className="size-4 shrink-0 fill-amber-400 text-amber-400" aria-hidden/>
                    <span className="font-semibold text-foreground">{trainer.rating.toFixed(2)}</span>
                    <span>({trainer.reviewCount} reviews)</span>
                  </span>
                  <span className="text-border">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-4 shrink-0" aria-hidden/>
                    {trainer.locationLabel}
                  </span>
                  <span className="text-border">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-4 shrink-0" aria-hidden/>
                    {trainer.yearsExperience} years experience
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {trainer.specializations.map((c) => (<span key={c} className="rounded-full border border-border bg-background/80 px-3 py-0.5 text-xs font-medium text-foreground shadow-sm">
                      {c}
                    </span>))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {trainer.bestFor.map((b) => (<span key={b} className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
                      {b}
                    </span>))}
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button asChild className="rounded-xl shadow-sm">
                    <a href="#book-session">Book session</a>
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl">
                    <Link href="/coaches">Browse more coaches</Link>
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.div className="rounded-2xl border border-border bg-card/90 p-5 shadow-sm backdrop-blur-sm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">From</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-foreground">
                {trainer.priceFrom}
                <span className="text-base font-normal text-muted-foreground"> / session</span>
              </p>
              <Separator className="my-4"/>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="size-4 shrink-0" aria-hidden/>
                  <span>
                    <span className="font-medium text-foreground">{trainer.clientsHelped}+</span> clients coached
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarClock className="size-4 shrink-0 text-primary" aria-hidden/>
                  <span>AI-ready calendar sync (demo)</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-3 py-10 min-[400px]:px-4 sm:space-y-16 sm:px-6 sm:py-14">
        <motion.section className="max-w-3xl space-y-3" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={fade} custom={0}>
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">About</h2>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">{trainer.longBio}</p>
        </motion.section>

        <motion.section className="space-y-4" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} variants={fade} custom={1}>
          <div className="flex items-center gap-2">
            <Award className="size-5 text-primary" aria-hidden/>
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">Certifications</h2>
          </div>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground sm:text-base">
            {trainer.certifications.map((c) => (<li key={c}>{c}</li>))}
          </ul>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Languages:</span> {trainer.languages.join(", ")}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Session lengths:</span>{" "}
            {trainer.sessionLengthsMin.map((m) => `${m} min`).join(" · ")}
          </p>
        </motion.section>

        <motion.section className="space-y-5" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} variants={fade} custom={2}>
          <div className="flex items-center gap-2">
            <MessageCircle className="size-5 text-primary" aria-hidden/>
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">Client reviews</h2>
          </div>
          <motion.div className="grid min-w-0 gap-4 md:grid-cols-2">
            {trainer.reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground md:col-span-2">No reviews yet.</p>
            ) : null}
            {trainer.reviews.map((r, i) => (<motion.div key={r.id} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.06 * i, duration: 0.35 }}>
                <Card className="h-full border-border/80 shadow-sm transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{r.author}</CardTitle>
                      <span className="inline-flex items-center gap-0.5 text-xs tabular-nums text-muted-foreground">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden/>
                        {r.rating.toFixed(1)}
                      </span>
                    </div>
                    <CardDescription>{r.dateLabel}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">&ldquo;{r.text}&rdquo;</p>
                  </CardContent>
                </Card>
              </motion.div>))}
          </motion.div>
        </motion.section>

        <motion.section className="space-y-5" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} variants={fade} custom={3}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl">Services & pricing</h2>
              <p className="mt-1 text-sm text-muted-foreground">Transparent packages — swap for your real SKUs later.</p>
            </div>
          </div>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trainer.services.length === 0 ? (
              <p className="text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
                No services listed yet.
              </p>
            ) : null}
            {trainer.services.map((s, i) => (<motion.div key={s.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 * i, duration: 0.35 }}>
                <Card className="h-full border-border/80 shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base">{s.title}</CardTitle>
                    <CardDescription>{s.durationMin} minutes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-2xl font-semibold tabular-nums text-foreground">{s.price}</p>
                    <p className="text-sm text-muted-foreground">{s.blurb}</p>
                  </CardContent>
                </Card>
              </motion.div>))}
          </div>
        </motion.section>

        {trainer.transformation ? (<motion.section className="overflow-hidden rounded-2xl border border-border bg-muted/20 shadow-sm" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={fade} custom={4}>
            <div className="border-b border-border/60 bg-card/60 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" aria-hidden/>
                <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{trainer.transformation.headline}</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Demo transformation — placeholders for before/after media.</p>
            </div>
            <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-[1fr_1fr_280px]">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Before</p>
                <div className="flex aspect-[4/3] items-end justify-center rounded-xl border border-dashed border-border bg-muted/50 pb-3 text-center text-xs text-muted-foreground">
                  {trainer.transformation.beforeLabel}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">After</p>
                <div className="flex aspect-[4/3] items-end justify-center rounded-xl border border-dashed border-border bg-primary/[0.06] pb-3 text-center text-xs text-muted-foreground">
                  {trainer.transformation.afterLabel}
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Progress metrics</p>
                  <ul className="mt-3 space-y-2">
                    {trainer.transformation.metrics.map((m) => (<li key={m.label} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className="font-semibold tabular-nums text-foreground">{m.value}</span>
                      </li>))}
                  </ul>
                </div>
                <div className="mt-4 border-t border-border/60 pt-4">
                  <p className="text-sm font-medium text-foreground">&ldquo;{trainer.transformation.testimonial}&rdquo;</p>
                  <p className="mt-2 text-xs text-muted-foreground">— {trainer.transformation.testimonialAuthor}</p>
                </div>
              </div>
            </div>
          </motion.section>) : null}

        <motion.section className="rounded-2xl border border-border bg-muted/15 p-4 sm:p-6" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} variants={fade} custom={5}>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <CalendarClock className="size-5 text-primary" aria-hidden/>
            Availability preview
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sample week — FitBook AI will read live availability after you connect a calendar backend.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border/80 bg-card">
            <table className="w-full min-w-[280px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-3 py-2 font-medium">Day</th>
                  <th className="px-3 py-2 font-medium">Hours</th>
                </tr>
              </thead>
              <tbody>
                {weekRows.map((row) => (<tr key={row.day} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2 text-muted-foreground">{row.day}</td>
                    <td className="px-3 py-2 font-medium text-foreground">{row.hours}</td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </motion.section>

        <motion.section id="book-session" className="scroll-mt-28 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-30px" }} variants={fade} custom={6}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Sparkles className="size-4" aria-hidden/>
                Book with FitBook
              </div>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">Reserve a session</h2>
              <p className="mt-1 text-sm text-muted-foreground">Pick a service and slot — demo flow below.</p>
            </div>
          </div>
          <TrainerBookingFlow trainerId={trainer.id} trainerName={trainer.name}/>
          <div className="mx-auto max-w-md rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-center text-xs text-muted-foreground">Prefer the quick CTA?</p>
            <div className="mt-3 flex justify-center">
              <TrainerProfileBookingCta trainerId={trainer.id}/>
            </div>
          </div>
        </motion.section>
      </div>
    </div>);
}
