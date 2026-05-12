"use client";
import { TrainerAvatar } from "@/components/visual/trainer-avatar";
import { mockBookings } from "@/lib/mock-bookings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useDemoData } from "@/hooks/use-demo-data";
function statusStyles(status: (typeof mockBookings)[number]["status"]) {
    switch (status) {
        case "confirmed":
            return "bg-emerald-500/10 text-emerald-800";
        case "pending":
            return "bg-amber-500/10 text-amber-900";
        case "cancelled":
            return "bg-muted text-muted-foreground";
        default:
            return "";
    }
}
export function BookingsTable() {
    const { data } = useDemoData();
    const rows = data?.bookings?.length ? data.bookings : mockBookings;
    return (<Card className="rounded-2xl border border-border/80 bg-card/90 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base">Upcoming bookings</CardTitle>
        <CardDescription>
          {data?.bookings?.length ? "From your workspace — replace with API data." : "Static sample — sign up to load full rows."}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <Table className="min-w-[36rem]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead className="hidden md:table-cell">Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (<TableRow key={row.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{row.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <TrainerAvatar seed={row.guest} size="sm"/>
                    <span className="font-medium">{row.guest}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden max-w-[220px] truncate md:table-cell text-muted-foreground">
                  {row.service}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">{row.date}</TableCell>
                <TableCell>
                  <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", statusStyles(row.status))}>
                    {row.status}
                  </span>
                </TableCell>
                <TableCell className="text-right text-sm font-medium tabular-nums">{row.amount}</TableCell>
              </TableRow>))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>);
}
