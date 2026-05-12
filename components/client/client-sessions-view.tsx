"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarClock, Filter } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useDemoData } from "@/hooks/use-demo-data";
import { mockBookings } from "@/lib/mock-bookings";
import type { BookingRow } from "@/lib/mock-bookings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrainerAvatar } from "@/components/visual/trainer-avatar";
import { ClientAiAssistantPanel } from "@/components/client/client-ai-assistant-panel";
import { cn } from "@/lib/utils";
function statusStyles(status: BookingRow["status"]) {
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
export function ClientSessionsView() {
    const { user } = useAuth();
    const { data } = useDemoData();
    const [status, setStatus] = useState<"all" | BookingRow["status"]>("all");
    const all = data?.bookings?.length ? data.bookings : mockBookings;
    const mine = useMemo(() => {
        if (!user)
            return [];
        return all.filter((b) => (b.clientEmail && b.clientEmail === user.email) ||
            (!b.clientEmail && b.guest === user.name));
    }, [all, user]);
    const display = mine.length > 0 ? mine : all;
    const filtered = status === "all" ? display : display.filter((b) => b.status === status);
    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            const ta = a.slotIso ? new Date(a.slotIso).getTime() : 0;
            const tb = b.slotIso ? new Date(b.slotIso).getTime() : 0;
            return tb - ta;
        });
    }, [filtered]);
    return (<div className="min-w-0 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Sessions</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Bookings tied to your account appear first. Public demo rows fill the list when you haven&apos;t booked yet.
        </p>
      </div>

      <ClientAiAssistantPanel variant="compact"/>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Filter className="size-3.5" aria-hidden/>
          Status
        </span>
        {(["all", "confirmed", "pending", "cancelled"] as const).map((s) => (<Button key={s} type="button" size="sm" variant={status === s ? "default" : "outline"} className="h-8 rounded-full capitalize" onClick={() => setStatus(s)}>
            {s}
          </Button>))}
      </div>

      {mine.length === 0 && (<motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
          No bookings linked to your email yet — book from a coach profile while signed in as a client to see them
          here and in your coach&apos;s calendar.
        </motion.div>)}

      <Card className="rounded-2xl border border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="size-4 text-primary" aria-hidden/>
            Schedule
          </CardTitle>
          <CardDescription>Filtered list · {sorted.length} row{sorted.length === 1 ? "" : "s"}</CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="overflow-x-auto">
            <Table className="min-w-[32rem]">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Coach / guest</TableHead>
                  <TableHead className="hidden sm:table-cell">Service</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((row) => (<TableRow key={row.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TrainerAvatar seed={row.guest} size="sm"/>
                        <span className="font-medium">{row.guest}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden max-w-[200px] truncate text-muted-foreground sm:table-cell">{row.service}</TableCell>
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
                      <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", statusStyles(row.status))}>
                        {row.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium tabular-nums">{row.amount}</TableCell>
                  </TableRow>))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/coaches" className="font-medium text-primary underline-offset-4 hover:underline">
          Find coaches
        </Link>
        <span className="text-border">·</span>
        <Link href="/me" className="font-medium text-primary underline-offset-4 hover:underline">
          ← Home
        </Link>
      </div>
    </div>);
}
