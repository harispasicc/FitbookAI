import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SitePublicHeader } from "@/components/site/site-public-header";
import { SiteFooter } from "@/components/site/site-footer";
import { COACH_PRICING_TIERS } from "@/lib/coach-pricing-tiers";
import { fitnessImages } from "@/lib/media-urls";
export const metadata: Metadata = {
    title: "Coach plans",
    description: "FitBook AI software plans for coaches and studios.",
};
export default function CoachPricingPage() {
    return (<>
      <div className="min-h-screen min-w-0 bg-background">
        <SitePublicHeader />
        <main className="mx-auto min-w-0 max-w-6xl px-3 py-10 min-[400px]:px-4 sm:px-6 sm:py-16 2xl:max-w-7xl">
          <div className="relative mb-12 overflow-hidden rounded-2xl border border-border/80 shadow-md">
            <Image src={fitnessImages.heroSession} alt="Coach with clients in a session" width={1200} height={360} className="aspect-[21/6] w-full object-cover" sizes="100vw"/>
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/55 to-transparent"/>
          </div>
          <div className="mb-10 max-w-2xl space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">For coaches</p>
            <h1 className="text-3xl font-semibold tracking-tight">Software plans</h1>
            <p className="text-muted-foreground">
              These monthly tiers are what <span className="font-medium text-foreground">you</span> pay FitBook to
              run your practice (calendar, clients, AI, analytics). Your clients pay <span className="font-medium text-foreground">you</span>{" "}
              for sessions. Those prices live on each coach profile, not here.
            </p>
            <p className="text-sm text-muted-foreground">
              Looking to book a coach instead?{" "}
              <Link href="/coaches" className="font-medium text-primary underline-offset-4 hover:underline">
                Find coaches
              </Link>
              {" · "}
              <Link href="/pricing" className="font-medium text-primary underline-offset-4 hover:underline">
                How client pricing works
              </Link>
            </p>
          </div>
          <div className="grid min-w-0 gap-4 lg:grid-cols-3">
            {COACH_PRICING_TIERS.map((tier) => (<div key={tier.name} className={`flex flex-col rounded-xl border bg-card p-6 shadow-sm ${tier.featured ? "border-primary shadow-md ring-1 ring-primary/15" : "border-border"}`}>
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">{tier.name}</h2>
                  {tier.featured ? (<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      Popular
                    </span>) : null}
                </div>
                <p className="text-3xl font-semibold tabular-nums">
                  {tier.price}
                  {tier.name === "Free" ? null : (<span className="text-base font-normal text-muted-foreground">/mo</span>)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{tier.blurb}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm">
                  {tier.items.map((item) => (<li key={item} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden/>
                      <span>{item}</span>
                    </li>))}
                </ul>
                <Link href={tier.href} className={`mt-8 inline-flex h-10 items-center justify-center rounded-xl text-sm font-medium ${tier.featured
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-background hover:bg-muted/60"}`}>
                  {tier.cta}
                </Link>
              </div>))}
          </div>
          <div className="mt-14 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <p className="text-lg font-medium">Questions?</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Plan prices are starting points. Connect your billing provider when you are ready to charge coaches.
            </p>
            <Link href="/trainer/login" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              Coach sign in
              <ArrowRight className="size-4" aria-hidden/>
            </Link>
          </div>
        </main>
      </div>
      <SiteFooter />
    </>);
}
