"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { CalendarClock, ChevronRight } from "lucide-react";
import { UpcomingSessionRow } from "@/components/dashboard/upcoming-session-row";
import { BusyDots } from "@/components/ui/busy-dots";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { useBookings } from "@/hooks/use-bookings";
import { useTrainerAnalytics } from "@/hooks/use-trainer-workspace";
import { dashCard } from "@/lib/dashboard-surfaces";
import { bookingStatusStyles } from "@/lib/booking-status-styles";
import type { BookingRow } from "@/lib/mock-bookings";
import { cn } from "@/lib/utils";

function sameCalendarDay(iso: string, day: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === day.getFullYear() &&
    d.getMonth() === day.getMonth() &&
    d.getDate() === day.getDate()
  );
}

export const DashboardUpcomingPanel = memo(function DashboardUpcomingPanel() {
  const { rows, loading } = useBookings();
  const { analytics } = useTrainerAnalytics();

  const upcoming = useMemo(() => {
    const ts = Date.now();
    return rows
      .filter(
        (b) =>
          b.status !== "cancelled" &&
          b.status !== "completed" &&
          b.slotIso &&
          new Date(b.slotIso).getTime() > ts,
      )
      .sort((a, b) => (a.slotIso ?? "").localeCompare(b.slotIso ?? ""))
      .slice(0, 3);
  }, [rows]);

  const weekStrip = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const count = rows.filter(
        (r) =>
          r.slotIso &&
          r.status !== "cancelled" &&
          sameCalendarDay(r.slotIso, d),
      ).length;
      return {
        label: d.toLocaleDateString(undefined, { weekday: "narrow" }),
        dayNum: d.getDate(),
        isToday: i === 0,
        hasBooking: count > 0,
        count,
      };
    });
  }, [rows]);

  const statusCounts = useMemo(() => {
    const ts = Date.now();
    const future = rows.filter(
      (b) =>
        b.slotIso &&
        new Date(b.slotIso).getTime() > ts &&
        b.status !== "cancelled" &&
        b.status !== "completed",
    );
    return {
      confirmed: future.filter((b) => b.status === "confirmed").length,
      pending: future.filter((b) => b.status === "pending").length,
    };
  }, [rows]);

  const utilizationPct = useMemo(() => {
    const bookedDays = weekStrip.filter((d) => d.hasBooking).length;
    const target = Math.max(analytics?.activeClients ?? 1, 1);
    const raw = Math.round(
      ((bookedDays / 7) * 50 + (upcoming.length / Math.min(target, 5)) * 50),
    );
    return Math.min(100, Math.max(raw, upcoming.length > 0 ? 12 : 0));
  }, [weekStrip, upcoming.length, analytics?.activeClients]);

  const reminders = analytics?.today.followUpClients.length ?? 0;

  return (
    <Card className={cn("border-0", dashCard.upcomingShell, "flex h-full flex-col")}>
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Upcoming</p>
          <p className="text-xs text-muted-foreground">Next sessions & capacity</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="h-8 gap-0.5 px-2 text-xs">
          <Link href="/calendar">
            All
            <ChevronRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2 rounded-lg bg-teal-500/[0.06] px-3 py-2 ring-1 ring-teal-500/15">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-teal-700">
              Week utilization
            </p>
            <p className="text-lg font-bold tabular-nums text-foreground">{utilizationPct}%</p>
          </div>
          <div className="flex gap-1">
            {statusCounts.confirmed > 0 ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                  bookingStatusStyles("confirmed"),
                )}
              >
                {statusCounts.confirmed} confirmed
              </span>
            ) : null}
            {statusCounts.pending > 0 ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                  bookingStatusStyles("pending"),
                )}
              >
                {statusCounts.pending} pending
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekStrip.map((d) => (
            <div
              key={d.dayNum}
              className={cn(
                "flex flex-col items-center rounded-lg py-1.5 text-center transition-colors",
                d.isToday && "bg-orange-500/10 ring-1 ring-orange-500/25",
                d.hasBooking && !d.isToday && "bg-teal-500/10",
                !d.hasBooking && !d.isToday && "bg-muted/30",
              )}
            >
              <span className="text-[10px] font-medium text-muted-foreground">{d.label}</span>
              <span
                className={cn(
                  "text-xs font-bold tabular-nums",
                  d.isToday ? "text-orange-600" : "text-foreground",
                )}
              >
                {d.dayNum}
              </span>
              {d.count > 0 ? (
                <span className="mt-0.5 size-1 rounded-full bg-teal-500" aria-hidden />
              ) : (
                <span className="mt-0.5 size-1" aria-hidden />
              )}
            </div>
          ))}
        </div>

        {reminders > 0 ? (
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-orange-600">{reminders}</span> follow-up
            {reminders === 1 ? "" : "s"} recommended
          </p>
        ) : null}

        <div className="min-h-0 flex-1">
          {loading ? (
            <div className="flex justify-center py-6">
              <BusyDots size="sm" />
            </div>
          ) : upcoming.length === 0 ? (
            <EmptyState
              compact
              icon={CalendarClock}
              title="No upcoming sessions"
              description="Open slots on your calendar to fill this panel."
            />
          ) : (
            <ul className="divide-y divide-border/40 rounded-xl bg-background/60 shadow-sm">
              {upcoming.map((row: BookingRow) => (
                <UpcomingSessionRow key={row.id} row={row} compact />
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
