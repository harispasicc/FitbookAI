"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import type { BookingRow } from "@/lib/mock-bookings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookings } from "@/hooks/use-bookings";
import { apiListTrainerCalendarSlots, type CalendarOpenSlotDto } from "@/lib/trainer-portal-api";
import { TrainerAvatar } from "@/components/visual/trainer-avatar";
import {
  bookingStatusCalendarClass,
  bookingStatusCalendarUsesLightText,
} from "@/lib/booking-status-styles";
import { cn } from "@/lib/utils";

function startOfWeekMonday(d: Date) {
    const x = new Date(d);
    const day = x.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    x.setDate(x.getDate() + diff);
    x.setHours(0, 0, 0, 0);
    return x;
}
function addDays(d: Date, n: number) {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
}
function sameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
export function WeeklyCalendarView() {
    const { rows: bookings, loading } = useBookings();
    const [weekOffset, setWeekOffset] = useState(0);
    const [detail, setDetail] = useState<BookingRow | null>(null);
    const [openSlots, setOpenSlots] = useState<CalendarOpenSlotDto[]>([]);
    const { days } = useMemo(() => {
        const base = addDays(startOfWeekMonday(new Date()), weekOffset * 7);
        const daysArr = Array.from({ length: 7 }, (_, i) => addDays(base, i));
        return { days: daysArr };
    }, [weekOffset]);

    useEffect(() => {
        const from = days[0]!;
        const to = new Date(days[6]!);
        to.setHours(23, 59, 59, 999);
        void apiListTrainerCalendarSlots(from, to)
            .then(setOpenSlots)
            .catch(() => setOpenSlots([]));
    }, [days]);

    const openSlotsByDay = useMemo(() => {
        const map = new Map<string, CalendarOpenSlotDto[]>();
        for (const day of days) {
            map.set(day.toISOString().slice(0, 10), []);
        }
        for (const s of openSlots) {
            const key = new Date(s.startsAt).toISOString().slice(0, 10);
            if (!map.has(key)) continue;
            map.get(key)!.push(s);
        }
        for (const arr of map.values()) {
            arr.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
        }
        return map;
    }, [openSlots, days]);

    const byDay = useMemo(() => {
        const map = new Map<string, BookingRow[]>();
        for (const day of days) {
            const key = day.toISOString().slice(0, 10);
            map.set(key, []);
        }
        for (const b of bookings) {
            const t = b.slotIso ? new Date(b.slotIso) : null;
            if (!t || Number.isNaN(t.getTime()))
                continue;
            const key = t.toISOString().slice(0, 10);
            if (!map.has(key))
                continue;
            map.get(key)!.push(b);
        }
        for (const arr of map.values()) {
            arr.sort((a, b) => (a.slotIso ?? "").localeCompare(b.slotIso ?? ""));
        }
        return map;
    }, [bookings, days]);
    const weekLabel = `${days[0]?.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${days[6]?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    return (<>
      <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-sm backdrop-blur-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Week view</CardTitle>
            <CardDescription>
              {loading ? "Loading bookings…" : "Session blocks from your live bookings."}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" className="size-9 shrink-0" aria-label="Previous week" onClick={() => setWeekOffset((w) => w - 1)}>
              <ChevronLeft className="size-4"/>
            </Button>
            <span className="min-w-[10rem] text-center text-sm font-medium tabular-nums text-foreground">{weekLabel}</span>
            <Button type="button" variant="outline" size="icon" className="size-9 shrink-0" aria-label="Next week" onClick={() => setWeekOffset((w) => w + 1)}>
              <ChevronRight className="size-4"/>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid min-w-0 auto-cols-fr grid-flow-col gap-px bg-border/60 max-md:overflow-x-auto md:grid-cols-7" data-calendar-week-root>
            {days.map((day) => {
            const key = day.toISOString().slice(0, 10);
            const list = byDay.get(key) ?? [];
            const isToday = sameDay(day, new Date());
            return (<div key={key} data-slot-day={key} className={cn("flex min-h-[14rem] min-w-[7.5rem] flex-col bg-background p-2 md:min-w-0", isToday && "bg-primary/[0.04]")}>
                  <div className="mb-2 flex flex-col border-b border-border/50 pb-2">
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <span className={cn("text-lg font-semibold tabular-nums", isToday && "text-primary")}>
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    {list.map((b) => {
                      const lightText = bookingStatusCalendarUsesLightText(b.status);
                      return (
                      <button key={b.id} type="button" data-booking-id={b.id} onClick={() => setDetail(b)} className={cn("touch-manipulation rounded-lg border px-2 py-1.5 text-left text-xs shadow-sm transition hover:opacity-95", bookingStatusCalendarClass(b.status))}>
                        <span
                          className={cn(
                            "flex items-center gap-1 font-medium",
                            lightText ? "text-white" : "text-foreground",
                          )}
                        >
                          <Clock
                            className={cn(
                              "size-3 shrink-0",
                              lightText ? "text-white/90" : "opacity-70",
                            )}
                            aria-hidden
                          />
                          {b.slotIso
                        ? new Date(b.slotIso).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                        })
                        : "—"}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 block truncate text-[11px]",
                            lightText ? "text-white/85" : "text-muted-foreground",
                          )}
                        >
                          {b.guest}
                        </span>
                      </button>
                      );
                    })}
                    {list.length === 0 ? (
                      (openSlotsByDay.get(key) ?? []).length === 0 ? (
                        <span className="mt-1 block rounded-md border border-dashed border-border/80 bg-muted/20 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                          No open slots
                        </span>
                      ) : (
                        <div className="mt-1 space-y-1">
                          {(openSlotsByDay.get(key) ?? []).slice(0, 3).map((s) => (
                            <span
                              key={s.id}
                              className="block rounded-md border border-dashed border-emerald-500/30 bg-emerald-500/5 px-2 py-1 text-[10px] font-medium text-emerald-900"
                            >
                              Open · {s.label}
                            </span>
                          ))}
                        </div>
                      )
                    ) : null}
                  </div>
                </div>);
        })}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {detail ? (<motion.div role="dialog" aria-modal="true" aria-labelledby="session-detail-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={() => setDetail(null)}>
            <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }} transition={{ type: "spring", stiffness: 380, damping: 32 }} className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p id="session-detail-title" className="text-lg font-semibold text-foreground">
                    Session details
                  </p>
                  <p className="text-sm text-muted-foreground">{detail.service}</p>
                </div>
                <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => setDetail(null)} aria-label="Close">
                  <X className="size-4"/>
                </Button>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <TrainerAvatar seed={detail.guest} size="md"/>
                  <div>
                    <p className="font-medium text-foreground">{detail.guest}</p>
                    <p className="text-xs text-muted-foreground">
                      {detail.slotIso
                ? new Date(detail.slotIso).toLocaleString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                })
                : detail.date}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", bookingStatusCalendarClass(detail.status))}>
                    {detail.status}
                  </span>
                  <span className="inline-flex rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium tabular-nums text-foreground">
                    {detail.amount}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Coach availability overlays and client messaging will connect here in a backend-backed build.
                </p>
              </div>
            </motion.div>
          </motion.div>) : null}
      </AnimatePresence>
    </>);
}
