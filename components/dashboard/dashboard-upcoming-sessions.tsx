"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { DashboardUpcomingPanel } from "@/components/dashboard/dashboard-upcoming-panel";
import { UpcomingSessionRow } from "@/components/dashboard/upcoming-session-row";
import { BusyDots } from "@/components/ui/busy-dots";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useBookings } from "@/hooks/use-bookings";
import { bookingStatusStyles } from "@/lib/booking-status-styles";
import { productUi } from "@/lib/product-ui";
import { TrainerAvatar } from "@/components/visual/trainer-avatar";
import { BookingRowActions } from "@/components/dashboard/booking-row-actions";
import { cn } from "@/lib/utils";

export const DashboardUpcomingSessions = memo(function DashboardUpcomingSessions({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { rows, loading } = useBookings();

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
      .slice(0, compact ? 6 : 12);
  }, [rows, compact]);

  if (compact) {
    return <DashboardUpcomingPanel />;
  }

  const list = (
    <Card className="overflow-hidden rounded-xl border border-border/80 shadow-sm">
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center py-10">
            <BusyDots />
          </div>
        ) : upcoming.length === 0 ? (
          <div className="p-6">
            <EmptyState
              compact
              icon={CalendarClock}
              title="No upcoming sessions"
              description="When clients book future slots, they appear here with one-click actions."
            />
          </div>
        ) : (
          <>
            <ul className="divide-y divide-border/60 md:hidden">
              {upcoming.map((row) => (
                <UpcomingSessionRow key={row.id} row={row} compact={false} />
              ))}
            </ul>
            <div className={cn(productUi.tableShell, "hidden md:block")}>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>When</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead className="hidden lg:table-cell">Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcoming.map((row) => (
                      <TableRow key={row.id} className="group">
                        <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">
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
                          <div className="flex items-center gap-2">
                            <TrainerAvatar seed={row.guest} size="sm" />
                            <span className="font-medium">{row.guest}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden max-w-[200px] truncate text-muted-foreground lg:table-cell">
                          {row.service}
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
                        <TableCell className="text-right">
                          <BookingRowActions row={row} role="trainer" />
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

  return (
    <DashboardSection
      title="Upcoming sessions"
      description="Next bookings with quick actions."
      dense
      priority="primary"
      action={
        <Button asChild variant="outline" size="sm" className="h-8 rounded-lg text-xs">
          <Link href="/calendar">All bookings</Link>
        </Button>
      }
    >
      {list}
    </DashboardSection>
  );
});
