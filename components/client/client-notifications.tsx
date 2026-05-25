"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
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
import {
  BOOKINGS_UPDATE_EVENT,
  CLIENT_PORTAL_UPDATE_EVENT,
  notifyClientPortalUpdated,
} from "@/lib/demo-data-events";
import {
  apiGetClientNotifications,
  apiMarkNotificationRead,
} from "@/lib/client-portal-api";
import type { ClientNotification } from "@/lib/client-mocks";
import { deferEffect } from "@/lib/defer-effect";
import { cn } from "@/lib/utils";

function toneRing(tone: ClientNotification["tone"]) {
  switch (tone) {
    case "success":
      return "border-emerald-500/25 bg-emerald-500/[0.06]";
    case "warning":
      return "border-amber-700/30 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-950/90";
    case "info":
      return "border-sky-500/25 bg-sky-500/[0.05]";
    default:
      return "border-border bg-muted/30";
  }
}

export function ClientNotifications() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ClientNotification[]>([]);

  const load = useCallback(async () => {
    if (!user || user.role !== "client") return;
    setLoading(true);
    try {
      const data = await apiGetClientNotifications();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "client") return;
    deferEffect(() => {
      void load();
    });
    function onUpdate() {
      void load();
    }
    window.addEventListener(CLIENT_PORTAL_UPDATE_EVENT, onUpdate);
    window.addEventListener(BOOKINGS_UPDATE_EVENT, onUpdate);
    return () => {
      window.removeEventListener(CLIENT_PORTAL_UPDATE_EVENT, onUpdate);
      window.removeEventListener(BOOKINGS_UPDATE_EVENT, onUpdate);
    };
  }, [user, load]);

  useEffect(() => {
    if (open) deferEffect(() => void load());
  }, [open, load]);

  const unreadCount = useMemo(
    () => items.filter((n) => !n.read).length,
    [items],
  );

  async function markRead(id: string) {
    const item = items.find((n) => n.id === id);
    if (!item || item.read) return;
    try {
      await apiMarkNotificationRead(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      notifyClientPortalUpdated();
    } catch {
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    }
  }

  async function markAllRead() {
    const unread = items.filter((n) => !n.read);
    if (unread.length === 0) return;
    await Promise.all(
      unread.map((n) =>
        apiMarkNotificationRead(n.id).catch(() => undefined),
      ),
    );
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    notifyClientPortalUpdated();
  }

  if (!user || user.role !== "client") {
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
          ) : items.length === 0 ? (
            <EmptyState
              inline
              compact
              className="w-full"
              icon={Bell}
              title="No notifications yet"
              description="Reminders and coach updates will appear here."
            />
          ) : (
            <ul className="space-y-1.5">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      void markRead(n.id);
                    }}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2.5 text-left transition-opacity hover:opacity-90",
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
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 ? (
          <>
            <DropdownMenuSeparator className="m-0" />
            <div className="px-3 py-2">
              <Link
                href="/me"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-primary hover:underline"
              >
                View on home
              </Link>
            </div>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
