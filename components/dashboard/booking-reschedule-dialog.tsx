"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusyDots } from "@/components/ui/busy-dots";
import { EmptyState } from "@/components/ui/empty-state";
import { ModalShell } from "@/components/ui/modal-shell";
import { apiFetchCoachAvailability, apiRescheduleBooking } from "@/lib/bookings-api";
import { notifyBookingsUpdated } from "@/lib/demo-data-events";
import { deferEffect } from "@/lib/defer-effect";
import { productUi } from "@/lib/product-ui";

type BookingRescheduleDialogProps = {
  bookingId: string;
  trainerProfileId: string;
  serviceId?: string;
  currentSlotLabel?: string;
  open: boolean;
  onClose: () => void;
};

export function BookingRescheduleDialog({
  bookingId,
  trainerProfileId,
  serviceId,
  currentSlotLabel,
  open,
  onClose,
}: BookingRescheduleDialogProps) {
  const [slots, setSlots] = useState<
    { id: string; label: string; startsAt: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const loadSlots = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setSelected(null);
    try {
      const data = await apiFetchCoachAvailability(trainerProfileId, {
        serviceId,
        limit: 40,
      });
      const now = Date.now();
      setSlots(
        data.upcomingSlots
          .filter((s) => !s.isBooked && new Date(s.startsAt).getTime() > now)
          .map((s) => ({
            id: s.id,
            label: s.label,
            startsAt: s.startsAt,
          })),
      );
    } catch {
      setLoadError("Could not load available times. Check your connection and try again.");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [trainerProfileId, serviceId]);

  useEffect(() => {
    if (!open) return;
    deferEffect(() => void loadSlots());
  }, [open, loadSlots]);

  async function submit() {
    if (!selected || saving) return;
    setSaving(true);
    setError(null);
    const result = await apiRescheduleBooking(bookingId, selected);
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    notifyBookingsUpdated();
    onClose();
  }

  const description = (
    <>
      Choose a new open time from your coach&apos;s calendar.
      {currentSlotLabel ? (
        <span className="mt-2 block rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Current time:</span>{" "}
          {currentSlotLabel}
        </span>
      ) : null}
    </>
  );

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Reschedule session"
      titleId="reschedule-dialog-title"
      description={description}
      footer={
        <>
          {error ? <p className="w-full text-sm text-destructive sm:mb-0">{error}</p> : null}
          <Button
            type="button"
            variant="outline"
            className={productUi.touchTarget}
            onClick={onClose}
            disabled={saving}
          >
            Close
          </Button>
          <Button
            type="button"
            className={productUi.touchTarget}
            onClick={() => void submit()}
            disabled={saving || !selected || loading || !!loadError}
          >
            {saving ? <BusyDots size="sm" className="mr-2" /> : null}
            Confirm new time
          </Button>
        </>
      }
    >
      <div className="min-h-[10rem]">
        {loading ? (
          <div className="flex justify-center py-10">
            <BusyDots />
          </div>
        ) : loadError ? (
          <div className="space-y-3 text-center">
            <div className={productUi.errorPanel}>{loadError}</div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={productUi.touchTarget}
              onClick={() => void loadSlots()}
            >
              <RefreshCw className="mr-1.5 size-3.5" aria-hidden />
              Try again
            </Button>
          </div>
        ) : slots.length === 0 ? (
          <EmptyState
            compact
            icon={CalendarClock}
            title="No alternative times yet"
            description="Your coach hasn't published more open slots. Keep your current time, or ask them to add availability, then try again."
          />
        ) : (
          <div className="space-y-1.5">
            {slots.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelected(s.id)}
                className={`flex w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors duration-150 ${productUi.touchTarget} ${
                  selected === s.id
                    ? "border-primary bg-primary/10 font-medium text-foreground shadow-sm"
                    : "border-border hover:border-primary/25 hover:bg-muted/40"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </ModalShell>
  );
}
