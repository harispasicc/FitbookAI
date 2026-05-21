"use client";

import { useState } from "react";
import { BookingRescheduleDialog } from "@/components/dashboard/booking-reschedule-dialog";
import { BookingReviewDialog } from "@/components/client/booking-review-dialog";
import { BusyDots } from "@/components/ui/busy-dots";
import {
  apiCancelBooking,
  apiUpdateBookingStatus,
  type AppBookingStatus,
} from "@/lib/bookings-api";
import { notifyBookingsUpdated } from "@/lib/demo-data-events";
import type { BookingRow } from "@/lib/mock-bookings";
import { Button } from "@/components/ui/button";

export function BookingRowActions({
  row,
  role,
}: {
  row: BookingRow;
  role: "client" | "trainer";
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  async function setStatus(status: AppBookingStatus) {
    setBusy(true);
    setError(null);
    const result = await apiUpdateBookingStatus(row.id, status);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    notifyBookingsUpdated();
  }

  async function cancel() {
    setBusy(true);
    setError(null);
    const result = await apiCancelBooking(row.id);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    notifyBookingsUpdated();
  }

  if (row.status === "cancelled") {
    return null;
  }

  if (row.status === "completed") {
    if (role === "client" && !row.hasReview) {
      return (
        <>
          <Button
            type="button"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setReviewOpen(true)}
          >
            Rate session
          </Button>
          <BookingReviewDialog
            bookingId={row.id}
            coachName={row.guest}
            serviceTitle={row.service}
            open={reviewOpen}
            onClose={() => setReviewOpen(false)}
            onSubmitted={() => notifyBookingsUpdated()}
          />
        </>
      );
    }
    return null;
  }

  const actions: {
    label: string;
    onClick: () => void;
    variant?: "outline" | "default";
  }[] = [];

  if (role === "trainer") {
    if (row.status === "pending") {
      actions.push({ label: "Confirm", onClick: () => void setStatus("confirmed") });
    }
    if (row.status === "confirmed") {
      actions.push({ label: "Complete", onClick: () => void setStatus("completed") });
    }
    if (row.status === "pending" || row.status === "confirmed") {
      actions.push({
        label: "Cancel",
        onClick: () => void cancel(),
        variant: "outline",
      });
    }
  }

  if (role === "client") {
    if (
      (row.status === "pending" || row.status === "confirmed") &&
      row.trainerId
    ) {
      actions.push({
        label: "Reschedule",
        onClick: () => setRescheduleOpen(true),
        variant: "outline",
      });
    }
    if (row.status === "pending" || row.status === "confirmed") {
      actions.push({
        label: "Cancel",
        onClick: () => void cancel(),
        variant: "outline",
      });
    }
  }

  if (actions.length === 0) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      {row.trainerId && rescheduleOpen ? (
        <BookingRescheduleDialog
          bookingId={row.id}
          trainerProfileId={row.trainerId}
          serviceId={row.serviceId}
          currentSlotLabel={
            row.slotIso
              ? new Date(row.slotIso).toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : row.date
          }
          open={rescheduleOpen}
          onClose={() => setRescheduleOpen(false)}
        />
      ) : null}
      <div className="flex flex-wrap justify-end gap-1">
        {actions.map((a) => (
          <Button
            key={a.label}
            type="button"
            size="sm"
            variant={a.variant ?? "default"}
            className="h-9 min-h-9 px-3 text-xs sm:h-7 sm:min-h-7 sm:px-2"
            disabled={busy}
            onClick={a.onClick}
          >
            {busy ? <BusyDots size="sm" className="scale-75" /> : a.label}
          </Button>
        ))}
      </div>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}

