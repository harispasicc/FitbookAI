"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { BusyDots } from "@/components/ui/busy-dots";
import {
  apiCreateServiceSlot,
  apiDeleteServiceSlot,
  apiListServiceSlots,
  type TrainerAvailabilitySlotDto,
  type TrainerServiceDto,
} from "@/lib/trainer-portal-api";
import { deferEffect } from "@/lib/defer-effect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatSlotDisplay(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ServiceOpenTimes({ service }: { service: TrainerServiceDto }) {
  const [slots, setSlots] = useState<TrainerAvailabilitySlotDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotAt, setSlotAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await apiListServiceSlots(service.id);
      setSlots(items.filter((s) => !s.isBooked));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load times");
    } finally {
      setLoading(false);
    }
  }, [service.id]);

  useEffect(() => {
    deferEffect(() => void load());
  }, [load]);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!slotAt) {
      setError("Pick a date and time.");
      return;
    }

    const startsAt = new Date(slotAt);
    if (Number.isNaN(startsAt.getTime())) {
      setError("Invalid date.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const created = await apiCreateServiceSlot(service.id, startsAt.toISOString());
      setSlots((cur) =>
        [...cur, created].sort(
          (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
        ),
      );
      setSlotAt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add time");
    } finally {
      setSaving(false);
    }
  }

  async function onRemove(slotId: string) {
    setError(null);
    try {
      await apiDeleteServiceSlot(service.id, slotId);
      setSlots((cur) => cur.filter((s) => s.id !== slotId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove time");
    }
  }

  return (
    <div className="space-y-3 border-t border-border/60 pt-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Open times for booking
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Clients pick from these when they book &ldquo;{service.title}&rdquo; ({service.durationMinutes}{" "}
          min sessions).
        </p>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <form onSubmit={(e) => void onAdd(e)} className="flex flex-wrap items-end gap-2">
        <div className="min-w-[12rem] flex-1 space-y-1">
          <Label htmlFor={`slot-${service.id}`} className="text-xs">
            Date & time
          </Label>
          <Input
            id={`slot-${service.id}`}
            type="datetime-local"
            value={slotAt}
            onChange={(e) => setSlotAt(e.target.value)}
            className="h-9"
          />
        </div>
        <Button type="submit" size="sm" variant="secondary" disabled={saving} className="rounded-lg">
          {saving ? <Loader2 className="size-4 animate-spin" /> : "Add time"}
        </Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-3">
          <BusyDots size="sm" />
        </div>
      ) : slots.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No open times yet — add at least one so clients can complete booking.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-muted/20 px-2.5 py-1.5 text-xs"
            >
              <span className="font-medium text-foreground">
                {formatSlotDisplay(slot.startsAt)}
              </span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                aria-label="Remove time"
                onClick={() => void onRemove(slot.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
