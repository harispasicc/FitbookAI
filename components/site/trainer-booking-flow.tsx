"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, Check, ChevronRight, Lock } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { appendDemoBooking } from "@/lib/demo-storage";
import type { TrainerOffering } from "@/lib/mock-trainer-offerings";
import { getTrainerOfferings, offeringLabel } from "@/lib/mock-trainer-offerings";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
type Step = 1 | 2 | 3;
function buildSlots(): {
    label: string;
    iso: string;
}[] {
    const out: {
        label: string;
        iso: string;
    }[] = [];
    const base = new Date();
    base.setMinutes(0, 0, 0);
    for (let d = 1; d <= 10; d++) {
        const day = new Date(base);
        day.setDate(day.getDate() + d);
        for (const hour of [7, 12, 17, 18]) {
            const slot = new Date(day);
            slot.setHours(hour, 0, 0, 0);
            if (slot.getTime() <= base.getTime())
                continue;
            out.push({
                label: slot.toLocaleString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                }),
                iso: slot.toISOString(),
            });
            if (out.length >= 12)
                return out;
        }
    }
    return out;
}
export function TrainerBookingFlow({ trainerId, trainerName }: {
    trainerId: string;
    trainerName: string;
}) {
    const { user, isHydrated } = useAuth();
    const offerings = useMemo(() => getTrainerOfferings(trainerId), [trainerId]);
    const slots = useMemo(() => buildSlots(), []);
    const [step, setStep] = useState<Step>(1);
    const [selected, setSelected] = useState<TrainerOffering | null>(null);
    const [slot, setSlot] = useState<{
        label: string;
        iso: string;
    } | null>(null);
    const [done, setDone] = useState(false);
    const canBook = isHydrated && user?.role === "client";
    function confirm() {
        if (!selected || !slot || !user)
            return;
        const dateLabel = new Date(slot.iso).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
        appendDemoBooking({
            id: `BK-${Date.now()}`,
            guest: user.name,
            service: offeringLabel(selected),
            date: dateLabel,
            status: "confirmed",
            amount: selected.kind === "group" ? "$18" : selected.kind === "online" ? "$32" : "$45",
            slotIso: slot.iso,
            trainerId,
            clientEmail: user.email,
        });
        setDone(true);
    }
    return (<section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Book a session</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a service, choose a slot, confirm — your booking syncs to the coach calendar and your Sessions tab
            (demo, browser storage).
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-1 text-xs font-medium text-muted-foreground">
          <span className={cn(step >= 1 && "text-primary")}>1 Service</span>
          <ChevronRight className="size-3 opacity-50" aria-hidden/>
          <span className={cn(step >= 2 && "text-primary")}>2 Time</span>
          <ChevronRight className="size-3 opacity-50" aria-hidden/>
          <span className={cn(step >= 3 && "text-primary")}>3 Confirm</span>
        </div>
      </div>

      {!canBook ? (<div className="mt-6 flex flex-col gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Lock className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden/>
            <p>
              <span className="font-medium text-foreground">Client sign in</span> to complete a booking. Coach
              accounts use the coach workspace instead.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href={`/login?trainer=${encodeURIComponent(trainerId)}`}>Client sign in</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/signup">Create client account</Link>
            </Button>
          </div>
        </div>) : done ? (<motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-lg border border-primary/25 bg-primary/5 p-4 text-sm">
          <p className="flex items-center gap-2 font-medium text-foreground">
            <Check className="size-4 text-primary" aria-hidden/>
            Booking confirmed with {trainerName}
          </p>
          <p className="mt-2 text-muted-foreground">
            It now appears in the coach&apos;s calendar and under{" "}
            <Link href="/me/sessions" className="font-medium text-primary underline-offset-2 hover:underline">
              your Sessions
            </Link>
            .
          </p>
        </motion.div>) : (<div className="mt-6 space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 ? (<motion.div key="s1" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="grid gap-3 sm:grid-cols-3">
                {offerings.map((o) => (<button key={o.id} type="button" onClick={() => {
                        setSelected(o);
                        setStep(2);
                    }} className={cn("touch-manipulation rounded-xl border bg-background p-4 text-left text-sm shadow-sm transition-all hover:border-primary/40 hover:shadow-md", selected?.id === o.id ? "border-primary ring-1 ring-primary/20" : "border-border")}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">{o.kind}</p>
                    <p className="mt-1 font-semibold text-foreground">{o.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{o.description}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {o.durationMin} min · up to {o.maxParticipants} ppl · {o.priceLabel}
                    </p>
                  </button>))}
              </motion.div>) : null}

            {step === 2 && selected ? (<motion.div key="s2" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-3">
                <p className="text-sm font-medium text-foreground">{offeringLabel(selected)}</p>
                <div className="grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
                  {slots.map((s) => (<button key={s.iso} type="button" onClick={() => {
                        setSlot(s);
                        setStep(3);
                    }} className={cn("touch-manipulation rounded-lg border px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/60", slot?.iso === s.iso ? "border-primary bg-primary/5" : "border-border")}>
                      <CalendarCheck className="mb-1 size-4 text-primary" aria-hidden/>
                      {s.label}
                    </button>))}
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)}>
                  ← Change service
                </Button>
              </motion.div>) : null}

            {step === 3 && selected && slot ? (<motion.div key="s3" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-4 rounded-lg border border-border bg-muted/15 p-4">
                <div className="text-sm">
                  <p className="font-medium text-foreground">{trainerName}</p>
                  <p className="text-muted-foreground">{offeringLabel(selected)}</p>
                  <p className="mt-2 font-medium text-foreground">{slot.label}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setStep(2)}>
                    ← Pick another time
                  </Button>
                  <Button type="button" size="sm" onClick={confirm}>
                    Confirm booking
                  </Button>
                </div>
              </motion.div>) : null}
          </AnimatePresence>
        </div>)}
    </section>);
}
