"use client";

import { CalendarClock } from "lucide-react";
import { BusyDots } from "@/components/ui/busy-dots";
import { EmptyState } from "@/components/ui/empty-state";
import { TrainerAvatar } from "@/components/visual/trainer-avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookings } from "@/hooks/use-bookings";

export function TodaySessions() {
  const { rows, loading } = useBookings();

  const todayKey = new Date().toISOString().slice(0, 10);
  const todayBookings = rows.filter((b) => {
    if (!b.slotIso) return false;
    return b.slotIso.slice(0, 10) === todayKey && b.status !== "cancelled";
  });

  const sessions = todayBookings.slice(0, 4).map((b) => ({
    time: new Date(b.slotIso!).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    client: b.guest,
    type: b.service,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Today</CardTitle>
        <CardDescription>
          Sessions scheduled for today from your live bookings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-4">
            <BusyDots size="sm" />
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            compact
            inline
            icon={CalendarClock}
            title="Nothing scheduled today"
            description="When clients book sessions for today, they show up here."
          />
        ) : (
          sessions.map((s) => (
            <div
              key={`${s.time}-${s.client}`}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-gradient-to-r from-muted/30 to-transparent px-3 py-2.5 text-sm shadow-sm"
            >
              <span className="font-mono text-xs tabular-nums text-muted-foreground">{s.time}</span>
              <TrainerAvatar seed={s.client} size="sm" className="shrink-0" />
              <div className="min-w-0 flex-1 text-right">
                <p className="truncate font-medium">{s.client}</p>
                <p className="truncate text-xs text-muted-foreground">{s.type}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
