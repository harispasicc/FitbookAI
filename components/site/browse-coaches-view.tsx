"use client";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import { MapPin, Monitor, Search, SlidersHorizontal, Sparkles, Star, Store, X } from "lucide-react";
import type { MockTrainer } from "@/lib/mock-trainers";
import type { DeliveryMode } from "@/lib/mock-trainers";
import { COACH_SPECIALIZATIONS, SPECIALIZATION_GROUPS } from "@/lib/coach-specializations";
import { trainerAvatarUrls } from "@/lib/media-urls";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
type DeliveryFilter = "all" | "online" | "in_person";
type RatingFilter = "all" | "4.5" | "4.7" | "4.8";
function coachMatchesDelivery(t: MockTrainer, f: DeliveryFilter) {
    if (f === "all")
        return true;
    const m = t.deliveryModes;
    if (f === "online")
        return m.includes("online") || m.includes("hybrid");
    return m.includes("in_person") || m.includes("hybrid");
}
function coachMatchesRating(t: MockTrainer, f: RatingFilter) {
    if (f === "all")
        return true;
    const min = Number(f);
    return t.rating >= min;
}
function coachMatchesSearch(t: MockTrainer, q: string) {
    if (!q.trim())
        return true;
    const s = q.trim().toLowerCase();
    const blob = [t.name, t.headline, t.bio, ...t.specializations, ...t.bestFor].join(" ").toLowerCase();
    return blob.includes(s);
}
function coachMatchesSpecs(t: MockTrainer, specs: Set<string>) {
    if (specs.size === 0)
        return true;
    return t.specializations.some((sp) => specs.has(sp));
}
function deliveryLabel(modes: DeliveryMode[]) {
    if (modes.includes("hybrid"))
        return "Hybrid";
    if (modes.includes("online") && modes.includes("in_person"))
        return "Hybrid";
    if (modes.includes("online"))
        return "Online";
    return "In person";
}
type BrowseCoachesViewProps = {
    coaches: MockTrainer[];
    loadError?: string | null;
};

export function BrowseCoachesView({ coaches, loadError = null }: BrowseCoachesViewProps) {
    const [query, setQuery] = useState("");
    const deferredQuery = useDeferredValue(query);
    const [delivery, setDelivery] = useState<DeliveryFilter>("all");
    const [rating, setRating] = useState<RatingFilter>("all");
    const [specs, setSpecs] = useState<Set<string>>(() => new Set());
    const [showAllSpecs, setShowAllSpecs] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 120);
        return () => clearTimeout(t);
    }, []);

    const filtered = useMemo(() => {
        return coaches.filter((t) => coachMatchesSearch(t, deferredQuery) &&
            coachMatchesDelivery(t, delivery) &&
            coachMatchesRating(t, rating) &&
            coachMatchesSpecs(t, specs));
    }, [coaches, deferredQuery, delivery, rating, specs]);
    function toggleSpec(sp: string) {
        startTransition(() => {
            setSpecs((prev) => {
                const next = new Set(prev);
                if (next.has(sp))
                    next.delete(sp);
                else
                    next.add(sp);
                return next;
            });
        });
    }
    function clearSpecs() {
        startTransition(() => setSpecs(new Set()));
    }
    return (<div className="mx-auto min-w-0 max-w-6xl space-y-8 px-3 py-10 min-[400px]:px-4 sm:space-y-10 sm:px-6 sm:py-14">
      <motion.div className="max-w-2xl space-y-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Marketplace</p>
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">Find your coach</h1>
        <p className="text-pretty text-sm text-muted-foreground sm:text-base">
          Search by goal, filter by specialty and how you want to train — then open a profile to book.
        </p>
      </motion.div>

      <motion.div className="flex flex-col gap-4 rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:gap-3 sm:p-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden/>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search coaches, goals, specialties…" className="h-11 border-border/80 bg-background/90 pl-9 pr-3" aria-label="Search coaches"/>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <SlidersHorizontal className="size-3.5" aria-hidden/>
            Format
          </span>
          {([
            { id: "all" as const, label: "All", icon: null as null },
            { id: "online" as const, label: "Online", icon: Monitor },
            { id: "in_person" as const, label: "In person", icon: Store },
        ] as const).map(({ id, label, icon: Icon }) => (<Button key={id} type="button" variant={delivery === id ? "default" : "outline"} size="sm" className={cn("h-9 rounded-full px-3.5", delivery === id && "shadow-sm")} onClick={() => startTransition(() => setDelivery(id))}>
              {Icon ? <Icon className="mr-1 size-3.5" aria-hidden/> : null}
              {label}
            </Button>))}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3 sm:border-t-0 sm:pt-0">
          <span className="text-xs font-medium text-muted-foreground">Rating</span>
          {(["all", "4.5", "4.7", "4.8"] as const).map((r) => (<Button key={r} type="button" variant={rating === r ? "default" : "outline"} size="sm" className={cn("h-9 rounded-full px-3", rating === r && "shadow-sm")} onClick={() => startTransition(() => setRating(r))}>
              {r === "all" ? "Any" : `${r}+`}
            </Button>))}
        </div>
      </motion.div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">Specialties</p>
          {specs.size > 0 ? (<Button type="button" variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground" onClick={clearSpecs}>
              <X className="size-3.5" aria-hidden/>
              Clear ({specs.size})
            </Button>) : null}
        </div>
        <LayoutGroup id="spec-filters">
          <motion.div layout className="flex flex-wrap gap-2">
            {(showAllSpecs ? COACH_SPECIALIZATIONS : (["Yoga", "HIIT", "Strength training", "Weight loss", "CrossFit", "Online coaching"] as const)).map((sp) => {
            const active = specs.has(sp);
            return (<motion.button layout key={sp} type="button" onClick={() => toggleSpec(sp)} className={cn("touch-manipulation rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm", active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground", isPending && "pointer-events-none opacity-70")} whileTap={{ scale: 0.97 }}>
                  {sp}
                </motion.button>);
        })}
          </motion.div>
        </LayoutGroup>
        <button type="button" onClick={() => setShowAllSpecs((v) => !v)} className="text-xs font-medium text-primary underline-offset-4 hover:underline">
          {showAllSpecs ? "Show fewer" : `Show all ${COACH_SPECIALIZATIONS.length} specialties`}
        </button>
        {!showAllSpecs ? (<p className="text-[11px] text-muted-foreground">
            {SPECIALIZATION_GROUPS.map((g) => g.title).join(" · ")} — expand to pick niche filters.
          </p>) : null}
      </div>

      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{filtered.length}</span>{" "}
        {filtered.length === 1 ? "coach" : "coaches"}
        {specs.size > 0 ? (<>
            {" "}
            matching <span className="font-medium text-foreground">{specs.size}</span> filter
            {specs.size > 1 ? "s" : ""}
          </>) : null}
      </p>

      {loadError ? (<div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center">
          <p className="text-sm font-medium text-foreground">Could not load coaches</p>
          <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
        </div>) : null}

      {!mounted ? (<ul className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (<li key={i} className="h-[340px] animate-pulse rounded-2xl border border-border/60 bg-muted/40"/>))}
        </ul>) : (<AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (<motion.div key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl border border-dashed border-border bg-muted/25 px-6 py-14 text-center">
              <Sparkles className="mx-auto size-10 text-primary/70" aria-hidden/>
              <p className="mt-4 text-base font-medium text-foreground">No coaches match these filters</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try clearing specialty chips, widening the rating, or switching format to &quot;All&quot;.
              </p>
              <Button type="button" className="mt-6 rounded-xl" variant="secondary" onClick={() => {
                    setQuery("");
                    setDelivery("all");
                    setRating("all");
                    clearSpecs();
                }}>
                Reset filters
              </Button>
            </motion.div>) : (<motion.ul key="grid" className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {filtered.map((trainer, index) => (<motion.li key={trainer.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ delay: index * 0.04, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
                  <CoachCard trainer={trainer}/>
                </motion.li>))}
            </motion.ul>)}
        </AnimatePresence>)}
    </div>);
}
function CoachCard({ trainer }: {
    trainer: MockTrainer;
}) {
    const src = trainerAvatarUrls[trainer.avatarIndex % trainerAvatarUrls.length] ?? trainerAvatarUrls[0];
    const badge = deliveryLabel(trainer.deliveryModes);
    return (<motion.article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-1 hover:border-border hover:shadow-md" whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}>
      <div className="relative border-b border-border/60 bg-muted/20 p-4 sm:p-5">
        <div className="flex gap-4">
          <Image src={src} alt="" width={80} height={80} className="size-20 shrink-0 rounded-2xl border border-border/80 object-cover shadow-sm sm:size-[5.25rem]" sizes="84px"/>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold tracking-tight text-foreground">{trainer.name}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">{trainer.headline}</p>
              </div>
              <span className="shrink-0 rounded-full border border-border bg-background/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {badge}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 tabular-nums">
                <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" aria-hidden/>
                <span className="font-medium text-foreground">{trainer.rating.toFixed(1)}</span>
                <span>({trainer.reviewCount})</span>
              </span>
              <span className="text-border">·</span>
              <span>{trainer.yearsExperience} yrs exp.</span>
            </div>
          </div>
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{trainer.bio}</p>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-wrap gap-1.5">
          {trainer.specializations.slice(0, 5).map((c) => (<span key={c} className="rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-foreground/90">
              {c}
            </span>))}
          {trainer.specializations.length > 5 ? (<span className="rounded-md bg-transparent px-1 py-0.5 text-[11px] text-muted-foreground">
              +{trainer.specializations.length - 5}
            </span>) : null}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {trainer.bestFor.map((b) => (<span key={b} className="rounded-full bg-primary/[0.08] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              {b}
            </span>))}
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden/>
            <span className="line-clamp-1">{trainer.locationLabel}</span>
          </span>
          <p className="text-sm font-semibold tabular-nums text-foreground">
            from {trainer.priceFrom}
            <span className="text-xs font-normal text-muted-foreground"> / session</span>
          </p>
        </div>
        <Link href={`/coaches/${trainer.id}`} className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90">
          View profile
        </Link>
      </div>
    </motion.article>);
}
