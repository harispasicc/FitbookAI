"use client";


import { CalendarClock, RefreshCw } from "lucide-react";
import { LoadingPlaceholder } from "@/components/ui/busy-dots";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/contexts/auth-context";
import { BookingRowActions } from "@/components/dashboard/booking-row-actions";
import { TrainerAvatar } from "@/components/visual/trainer-avatar";
import { bookingStatusStyles } from "@/lib/booking-status-styles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { productUi } from "@/lib/product-ui";
import { cn } from "@/lib/utils";
import { useBookings } from "@/hooks/use-bookings";

export function BookingsTable() {
  const { user } = useAuth();
  const { rows, loading, error, refresh } = useBookings();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upcoming bookings</CardTitle>
        <CardDescription>
          Live bookings from your FitBook workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        {loading ? (
          <LoadingPlaceholder className="mx-6 mb-6 border-0 bg-transparent" minHeight="min-h-[6rem]" />
        ) : error ? (
          <div className="space-y-3 px-6 pb-6">
            <p className="text-sm text-destructive">{error}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>
              <RefreshCw className="mr-1.5 size-3.5" aria-hidden />
              Try again
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <div className="px-4 pb-6 sm:px-6">
            <EmptyState
              compact
              icon={CalendarClock}
              title="No bookings yet"
              description="When clients book from your public profile, sessions appear here. Share your coach page to get started."
            />
          </div>
        ) : (
          <>
          <ul className="space-y-3 px-4 pb-4 md:hidden">
            {rows.map((row) => (
              <li
                key={row.id}
                className="rounded-xl border border-border/80 bg-muted/20 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <TrainerAvatar seed={row.guest} size="sm" />
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{row.guest}</p>
                      <p className="truncate text-sm text-muted-foreground">{row.service}</p>
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
                  <div className="col-span-2">
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
                    <dd className="font-medium tabular-nums">{row.amount}</dd>
                  </div>
                </dl>
                {user?.role === "trainer" ? (
                  <div className="mt-3 flex justify-end">
                    <BookingRowActions row={row} role="trainer" />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
          <div className={cn(productUi.tableShell, "hidden md:block")}>
          <Table className="min-w-[40rem]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="hidden w-[100px] sm:table-cell">ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Service</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[140px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">
                    {row.id.slice(0, 8)}…
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TrainerAvatar seed={row.guest} size="sm" />
                      <span className="font-medium">{row.guest}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden max-w-[220px] truncate text-muted-foreground md:table-cell">
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
                    {user?.role === "trainer" ? (
                      <BookingRowActions row={row} role="trainer" />
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
