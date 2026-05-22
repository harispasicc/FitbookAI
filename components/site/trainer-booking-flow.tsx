"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Check,
  ChevronRight,
  Lock,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  apiCreateBooking,
  apiFetchCoachAvailability,
  apiFetchCoachServices,
  type CoachAvailabilitySlotDto,
  type CoachServiceDto,
} from "@/lib/bookings-api";
import { notifyBookingsUpdated } from "@/lib/demo-data-events";
import { BusyDots } from "@/components/ui/busy-dots";
import { deferEffect } from "@/lib/defer-effect";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { productUi } from "@/lib/product-ui";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

function formatSlotLabel(startsAt: string) {
  return new Date(startsAt).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function TrainerBookingFlow({
  trainerId,
  trainerName,
}: {
  trainerId: string;
  trainerName: string;
}) {
  const { user, isHydrated } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [services, setServices] = useState<CoachServiceDto[]>([]);
  const [slots, setSlots] = useState<CoachAvailabilitySlotDto[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CoachServiceDto | null>(null);
  const [slot, setSlot] = useState<CoachAvailabilitySlotDto | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slotsReloadKey, setSlotsReloadKey] = useState(0);
  const [slotsComparedAtMs, setSlotsComparedAtMs] = useState(0);

  const canBook = isHydrated && user?.role === "client";

  const openSlots = useMemo(() => {
    if (!selected) return [];
    return slots.filter((s) => {
      if (s.isBooked) return false;
      if (
        slotsComparedAtMs > 0 &&
        new Date(s.startsAt).getTime() <= slotsComparedAtMs
      ) {
        return false;
      }
      return s.serviceId === null || s.serviceId === selected.id;
    });
  }, [slots, selected, slotsComparedAtMs]);

  const loadServices = useCallback(async () => {
    setLoadState("loading");
    setLoadError(null);
    try {
      const svc = await apiFetchCoachServices(trainerId);
      setServices(svc);
      setLoadState("ready");
    } catch (e) {
      setLoadState("error");
      setLoadError(
        e instanceof Error ? e.message : "Could not load booking options",
      );
    }
  }, [trainerId]);

  useEffect(() => {
    deferEffect(() => void loadServices());
  }, [loadServices]);

  useEffect(() => {
    if (!selected) {
      deferEffect(() => {
        setSlots([]);
        setSlotsLoading(false);
        setSlotsComparedAtMs(0);
      });
      return;
    }

    const serviceId = selected.id;
    let cancelled = false;

    async function loadSlots() {
      setSlotsLoading(true);
      setLoadError(null);
      try {
        const availability = await apiFetchCoachAvailability(trainerId, {
          serviceId,
          limit: 50,
        });
        if (cancelled) return;
        setSlots(availability.upcomingSlots);
        setSlotsComparedAtMs(Date.now());
        setSlot(null);
      } catch (e) {
        if (cancelled) return;
        setLoadError(
          e instanceof Error ? e.message : "Could not load time slots",
        );
        setSlots([]);
        setSlotsComparedAtMs(0);
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    }

    deferEffect(() => void loadSlots());
    return () => {
      cancelled = true;
    };
  }, [trainerId, selected, slotsReloadKey]);

  async function confirm() {
    if (!selected || !slot || !user || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    const result = await apiCreateBooking({
      trainerProfileId: trainerId,
      serviceId: selected.id,
      availabilitySlotId: slot.id,
    });

    setSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.message);
      return;
    }

    notifyBookingsUpdated();
    setDone(true);
  }

  return (
    <section className={cn("min-w-0", productUi.panel)}>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Book a session</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a service, choose an open slot, and confirm. Your booking
              appears in Sessions and on the coach calendar.
            </p>
          </div>
          <div className="flex max-w-full flex-wrap items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-1 text-[11px] font-medium text-muted-foreground sm:text-xs">
            <span className={cn(step >= 1 && "text-primary")}>1 Service</span>
            <ChevronRight className="size-3 shrink-0 opacity-50" aria-hidden />
            <span className={cn(step >= 2 && "text-primary")}>2 Time</span>
            <ChevronRight className="size-3 shrink-0 opacity-50" aria-hidden />
            <span className={cn(step >= 3 && "text-primary")}>3 Confirm</span>
          </div>
        </div>

        {!canBook ? (
          <div className="mt-6 flex flex-col gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Lock className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
              <p>
                <span className="font-medium text-foreground">Client sign in</span>{" "}
                to complete a booking. Coach accounts use the coach workspace
                instead.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button asChild size="sm" className="min-h-10 w-full sm:w-auto">
                <Link
                  href={`/login?trainer=${encodeURIComponent(trainerId)}`}
                >
                  Client sign in
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="min-h-10 w-full sm:w-auto">
                <Link href="/signup">Create client account</Link>
              </Button>
            </div>
          </div>
        ) : done ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-lg border border-primary/25 bg-primary/5 p-4 text-sm"
          >
            <p className="flex items-center gap-2 font-medium text-foreground">
              <Check className="size-4 shrink-0 text-primary" aria-hidden />
              Booking requested with {trainerName}
            </p>
            <p className="mt-2 text-muted-foreground">
              Status is{" "}
              <span className="font-medium text-foreground">pending</span> until
              the coach confirms. Track it under{" "}
              <Link
                href="/me/sessions"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                your Sessions
              </Link>
              .
            </p>
          </motion.div>
        ) : loadState === "loading" ? (
          <div className="mt-6 min-h-[8rem] space-y-3">
            <div className="flex min-h-[6rem] items-center justify-center">
              <BusyDots />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl border border-border/60 bg-muted/30"
                />
              ))}
            </div>
          </div>
        ) : loadState === "error" ? (
          <div className={cn("mt-6 space-y-3", productUi.errorPanel)}>
            <p>{loadError}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-10"
              onClick={() => void loadServices()}
            >
              <RefreshCw className="mr-1.5 size-3.5" aria-hidden />
              Try again
            </Button>
          </div>
        ) : services.length === 0 ? (
          <EmptyState
            className="mt-6"
            icon={CalendarX}
            title="No services available"
            description="This coach hasn't published bookable services yet. Check back soon or browse other coaches."
          >
            <Button asChild variant="secondary" size="sm" className="min-h-10">
              <Link href="/coaches">Browse coaches</Link>
            </Button>
          </EmptyState>
        ) : (
          <div className="mt-6 space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelected(s);
                        setStep(2);
                        setSubmitError(null);
                      }}
                      className={cn(
                        "touch-manipulation rounded-2xl border bg-background p-4 text-left text-sm shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-primary/30 hover:shadow-md",
                        selected?.id === s.id
                          ? "border-primary ring-1 ring-primary/20"
                          : "border-border",
                      )}
                    >
                      <p className="font-semibold text-foreground">{s.title}</p>
                      {s.description ? (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {s.description}
                        </p>
                      ) : null}
                      <p className="mt-3 text-xs text-muted-foreground">
                        {s.durationMinutes} min · {s.priceLabel}
                      </p>
                    </button>
                  ))}
                </motion.div>
              ) : null}

              {step === 2 && selected ? (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="space-y-3"
                >
                  <p className="text-sm font-medium text-foreground">
                    {selected.title}
                  </p>
                  {slotsLoading ? (
                    <div className="flex min-h-[8rem] items-center justify-center">
                      <BusyDots />
                    </div>
                  ) : loadError && openSlots.length === 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-destructive">{loadError}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-10"
                        onClick={() => setSlotsReloadKey((k) => k + 1)}
                      >
                        <RefreshCw className="mr-1.5 size-3.5" aria-hidden />
                        Retry
                      </Button>
                    </div>
                  ) : openSlots.length === 0 ? (
                    <EmptyState
                      compact
                      icon={CalendarClock}
                      title="No available slots right now"
                      description="This coach has no open times for this service. Try another coach or check back when they add availability."
                    >
                      <Button asChild variant="secondary" size="sm" className="min-h-10">
                        <Link href="/coaches">Browse coaches</Link>
                      </Button>
                    </EmptyState>
                  ) : (
                    <div className="grid max-h-64 gap-2 overflow-y-auto overscroll-contain sm:grid-cols-2">
                      {openSlots.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSlot(s);
                            setStep(3);
                            setSubmitError(null);
                          }}
                          className={cn(
                            "touch-manipulation rounded-lg border px-3 py-3 text-left text-sm transition-colors duration-150 hover:border-primary/25 hover:bg-muted/50",
                            slot?.id === s.id
                              ? "border-primary bg-primary/5"
                              : "border-border",
                          )}
                        >
                          <CalendarCheck
                            className="mb-1 size-4 text-primary"
                            aria-hidden
                          />
                          {formatSlotLabel(s.startsAt)}
                        </button>
                      ))}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="min-h-10"
                    onClick={() => {
                      setStep(1);
                      setSlot(null);
                    }}
                  >
                    ← Change service
                  </Button>
                </motion.div>
              ) : null}

              {step === 3 && selected && slot ? (
                <motion.div
                  key="s3"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="space-y-4 rounded-lg border border-border bg-muted/15 p-4"
                >
                  <div className="text-sm">
                    <p className="font-medium text-foreground">{trainerName}</p>
                    <p className="text-muted-foreground">{selected.title}</p>
                    <p className="mt-2 font-medium text-foreground">
                      {formatSlotLabel(slot.startsAt)}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {selected.priceLabel}
                    </p>
                  </div>
                  {submitError ? (
                    <p className="text-sm text-destructive" role="alert">
                      {submitError}
                    </p>
                  ) : null}
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-h-11 w-full sm:w-auto"
                      onClick={() => setStep(2)}
                      disabled={submitting}
                    >
                      ← Pick another time
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="min-h-11 w-full sm:w-auto"
                      onClick={() => void confirm()}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <BusyDots size="sm" className="[&_span]:bg-primary-foreground/90" />
                      ) : (
                        "Confirm booking"
                      )}
                    </Button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </section>
  );
}
