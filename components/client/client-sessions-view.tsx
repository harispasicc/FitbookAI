"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, Filter, RefreshCw, SearchX } from "lucide-react";
import { LoadingPlaceholder } from "@/components/ui/busy-dots";
import { useAuth } from "@/contexts/auth-context";
import { apiGetClientCoach, type ClientCoachDto } from "@/lib/client-portal-api";
import { BookingRowActions } from "@/components/dashboard/booking-row-actions";
import { TrainerAvatar } from "@/components/visual/trainer-avatar";
import { ClientAiAssistantPanelLazy } from "@/components/client/client-ai-assistant-panel-lazy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBookings } from "@/hooks/use-bookings";
import {
  bookingStatusFilterClass,
  bookingStatusStyles,
} from "@/lib/booking-status-styles";
import type { BookingRow } from "@/lib/mock-bookings";
import { deferEffect } from "@/lib/defer-effect";
import { productUi, productPageHeader } from "@/lib/product-ui";
import { cn } from "@/lib/utils";

export function ClientSessionsView() {
  const { user } = useAuth();
  const { rows, loading, error, refresh } = useBookings();
  const [status, setStatus] = useState<"all" | BookingRow["status"]>("all");
  const [linkedCoach, setLinkedCoach] = useState<ClientCoachDto | null>(null);

  useEffect(() => {
    if (user?.role !== "client") {
      deferEffect(() => setLinkedCoach(null));
      return;
    }
    let cancelled = false;
    void apiGetClientCoach()
      .then((coach) => {
        if (!cancelled) setLinkedCoach(coach);
      })
      .catch(() => {
        if (!cancelled) setLinkedCoach(null);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.role]);

  const filtered =
    status === "all" ? rows : rows.filter((b) => b.status === status);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ta = a.slotIso ? new Date(a.slotIso).getTime() : 0;
      const tb = b.slotIso ? new Date(b.slotIso).getTime() : 0;
      return tb - ta;
    });
  }, [filtered]);

  return (
    <div className="min-w-0 space-y-6">
      <div className={productPageHeader()}>
        <h1 className={productUi.pageTitle}>Sessions</h1>
        <p className={productUi.pageLead}>
          {linkedCoach
            ? `Your sessions with ${linkedCoach.fullName ?? "your coach"}. Book from their profile to get started.`
            : "Your bookings with coaches. Choose a coach, then pick a service and time."}
        </p>
      </div>

      <ClientAiAssistantPanelLazy variant="compact" />

      {loading ? (
        <LoadingPlaceholder minHeight="min-h-[6rem]" className="border-0 bg-transparent" />
      ) : error ? (
        <div className={productUi.errorPanel}>
          <p>{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>
            <RefreshCw className="mr-1.5 size-3.5" aria-hidden />
            Try again
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No sessions booked yet"
          description={
            linkedCoach
              ? `You’re already linked with ${linkedCoach.fullName ?? "your coach"} on Home. Book a slot and it will show up here.`
              : "Browse coaches, pick a service and time, and your sessions will show up here."
          }
        >
          {linkedCoach ? (
            <Button asChild className="min-h-10">
              <Link href={`/coaches/${linkedCoach.id}`}>
                Book with {linkedCoach.fullName ?? "your coach"}
              </Link>
            </Button>
          ) : (
            <Button asChild className="min-h-10">
              <Link href="/coaches">Find coaches</Link>
            </Button>
          )}
        </EmptyState>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Filter className="size-3.5" aria-hidden />
              Status
            </span>
            {(["all", "pending", "confirmed", "completed", "cancelled"] as const).map(
              (s) => (
                <Button
                  key={s}
                  type="button"
                  size="sm"
                  variant="outline"
                  className={cn(
                    productUi.filterChip,
                    bookingStatusFilterClass(s, status === s),
                  )}
                  onClick={() => setStatus(s)}
                >
                  {s}
                </Button>
              ),
            )}
          </div>

          {sorted.length === 0 ? (
            <EmptyState
              compact
              icon={SearchX}
              title="No sessions match this filter"
              description="Try another status or view all bookings."
            >
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="min-h-10"
                onClick={() => setStatus("all")}
              >
                Show all
              </Button>
            </EmptyState>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarClock className="size-4 text-primary" aria-hidden />
                  Schedule
                </CardTitle>
                <CardDescription>
                  {sorted.length} session{sorted.length === 1 ? "" : "s"}
                  {status !== "all" ? ` · ${status}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
                <ul className="space-y-3 md:hidden">
                  {sorted.map((row) => (
                    <li
                      key={row.id}
                      className="rounded-xl border border-border/80 bg-muted/20 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <TrainerAvatar seed={row.guest} size="sm" />
                          <div className="min-w-0">
                            <p className="font-medium text-foreground">{row.guest}</p>
                            <p className="text-sm text-muted-foreground">{row.service}</p>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                            bookingStatusStyles(row.status),
                          )}
                        >
                          {row.status}
                        </span>
                      </div>
                      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <dt className="text-xs text-muted-foreground">When</dt>
                          <dd className="font-medium text-foreground">
                            {row.slotIso
                              ? new Date(row.slotIso).toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })
                              : row.date}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Amount</dt>
                          <dd className="font-medium tabular-nums text-foreground">{row.amount}</dd>
                        </div>
                      </dl>
                      <div className="mt-3 flex justify-end">
                        <BookingRowActions row={row} role="client" />
                      </div>
                    </li>
                  ))}
                </ul>
                <div className={cn(productUi.tableShell, "hidden md:block")}>
                  <Table className={productUi.tableMinWidth}>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Coach</TableHead>
                        <TableHead className="hidden sm:table-cell">Service</TableHead>
                        <TableHead>When</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[120px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sorted.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TrainerAvatar seed={row.guest} size="sm" />
                              <span className="font-medium">{row.guest}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden max-w-[200px] truncate text-muted-foreground sm:table-cell">
                            {row.service}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-muted-foreground">
                            {row.slotIso
                              ? new Date(row.slotIso).toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })
                              : row.date}
                          </TableCell>
                          <TableCell>
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                                bookingStatusStyles(row.status),
                              )}
                            >
                              {row.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium tabular-nums">
                            {row.amount}
                          </TableCell>
                          <TableCell className="text-right">
                            <BookingRowActions row={row} role="client" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-3 text-sm">
        {linkedCoach ? (
          <Link
            href={`/coaches/${linkedCoach.id}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Book with {linkedCoach.fullName ?? "your coach"}
          </Link>
        ) : (
          <Link
            href="/coaches"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Find coaches
          </Link>
        )}
        <span className="text-border">·</span>
        <Link
          href="/me"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          ← Home
        </Link>
      </div>
    </div>
  );
}
