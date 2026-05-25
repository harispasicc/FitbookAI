"use client";

import { BookingRowActions } from "@/components/dashboard/booking-row-actions";
import { TrainerAvatar } from "@/components/visual/trainer-avatar";
import { bookingStatusStyles } from "@/lib/booking-status-styles";
import type { BookingRow } from "@/lib/mock-bookings";
import { cn } from "@/lib/utils";

function formatSlot(slotIso: string | null | undefined, fallback: string): string {
  if (!slotIso) return fallback;
  return new Date(slotIso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function UpcomingSessionRow({
  row,
  compact = false,
}: {
  row: BookingRow;
  compact?: boolean;
}) {
  const when = formatSlot(row.slotIso, row.date);

  if (compact) {
    return (
      <li className="px-4 py-3">
        <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-2.5 gap-y-2">
          <TrainerAvatar seed={row.guest} size="sm" className="row-span-2 mt-0.5" />
          <div className="min-w-0 space-y-0.5">
            <p className="truncate text-sm font-semibold leading-tight text-foreground">
              {row.guest}
            </p>
            <p className="truncate text-xs text-muted-foreground">{row.service}</p>
            <p className="text-[11px] tabular-nums text-muted-foreground">{when}</p>
          </div>
          <div className="col-span-2 flex flex-wrap items-center gap-1.5 border-t border-border/50 pt-2">
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                bookingStatusStyles(row.status),
              )}
            >
              {row.status}
            </span>
            <BookingRowActions row={row} role="trainer" layout="compact" />
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <TrainerAvatar seed={row.guest} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{row.guest}</p>
          <p className="truncate text-sm text-muted-foreground">{row.service}</p>
          <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">{when}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
            bookingStatusStyles(row.status),
          )}
        >
          {row.status}
        </span>
        <BookingRowActions row={row} role="trainer" />
      </div>
    </li>
  );
}
