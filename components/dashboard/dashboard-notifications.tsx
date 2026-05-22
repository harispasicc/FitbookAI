"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTrainerWorkspace } from "@/contexts/trainer-workspace-context";
import { BusyDots } from "@/components/ui/busy-dots";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BOOKINGS_UPDATE_EVENT } from "@/lib/demo-data-events";
import {
  apiListTrainerNotifications,
  apiMarkTrainerNotificationsRead,
  type TrainerNotificationDto,
} from "@/lib/trainer-portal-api";
import { deferEffect } from "@/lib/defer-effect";
import { cn } from "@/lib/utils";

function toneRing(tone: TrainerNotificationDto["tone"]) {
  switch (tone) {
    case "success":
      return "border-emerald-500/25 bg-emerald-500/5";
    case "warning":
      return "border-orange-500/25 bg-orange-500/5";
    case "neutral":
      return "border-border/70 bg-muted/20";
    default:
      return "border-primary/20 bg-primary/5";
  }
}

export function DashboardNotifications() {
  const { user } = useAuth();
  const { refreshClients } = useTrainerWorkspace();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<TrainerNotificationDto[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());

  const load = useCallback(async () => {
    if (!user || user.role !== "trainer") return;
    setLoading(true);
    try {
      const data = await apiListTrainerNotifications();
      setItems(data.items);
      setReadIds(new Set(data.readIds));
    } catch {
      setItems([]);
      setReadIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "trainer") return;
    deferEffect(() => void load());
    function onUpdate() {
      void load();
    }
    window.addEventListener(BOOKINGS_UPDATE_EVENT, onUpdate);
    return () => window.removeEventListener(BOOKINGS_UPDATE_EVENT, onUpdate);
  }, [user, load]);

  useEffect(() => {
    if (!open) return;
    deferEffect(() => {
      void load();
      void refreshClients();
    });
  }, [open, load, refreshClients]);

  const withReadState = useMemo(
    () =>
      items.map((n) => ({
        ...n,
        read: readIds.has(n.id),
      })),
    [items, readIds],
  );

  const unreadCount = withReadState.filter((n) => !n.read).length;

  async function markRead(id: string) {
    try {
      const result = await apiMarkTrainerNotificationsRead({ notificationId: id });
      setReadIds(new Set(result.readIds));
    } catch {
      setReadIds((prev) => new Set(prev).add(id));
    }
  }

  async function markAllRead() {
    try {
      const result = await apiMarkTrainerNotificationsRead({ markAll: true });
      setReadIds(new Set(result.readIds));
    } catch {
      setReadIds(new Set(withReadState.map((n) => n.id)));
    }
  }

  if (!user || user.role !== "trainer") {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative size-10 shrink-0 touch-manipulation"
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
        >
          <Bell className="size-5 text-muted-foreground" />
          {unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[min(100vw-2rem,22rem)] p-0" align="end">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="text-xs font-medium text-primary hover:underline"
            >
              Mark all read
            </button>
          ) : null}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-80 overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <BusyDots />
            </div>
          ) : withReadState.length === 0 ? (
            <EmptyState
              inline
              compact
              icon={Bell}
              title="No notifications yet"
              description="New bookings and session updates will appear here."
            />
          ) : (
            <ul className="space-y-1.5">
              {withReadState.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.href}
                    onClick={() => {
                      void markRead(n.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "block rounded-xl border px-3 py-2.5 transition-opacity hover:opacity-90",
                      toneRing(n.tone),
                      n.read && "opacity-60",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm font-medium text-foreground",
                          !n.read && "font-semibold",
                        )}
                      >
                        {n.title}
                      </p>
                      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        {n.timeLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {n.body}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
