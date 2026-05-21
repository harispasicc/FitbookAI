"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, LayoutGrid, Search, Table2 } from "lucide-react";
import { TrainerAvatar } from "@/components/visual/trainer-avatar";
import { LoadingPlaceholder } from "@/components/ui/busy-dots";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrainerPlanBanner } from "@/components/dashboard/trainer-plan-banner";
import { useTrainerClients } from "@/hooks/use-trainer-workspace";
import type { TrainerClientDto } from "@/lib/trainer-portal-api";
import { clientStatusBadgeMarkup } from "@/lib/client-status-styles";
import { deferEffect } from "@/lib/defer-effect";
import { cn } from "@/lib/utils";

function normalizeQuery(q: string) {
  return q.trim().toLowerCase();
}

function clientMatchesQuery(client: TrainerClientDto, rawQuery: string) {
  const query = normalizeQuery(rawQuery);
  if (!query) return true;

  const haystack = [
    client.name,
    client.email,
    client.goal,
    client.notes,
    client.status,
    client.nextSession,
    client.lastSession,
    String(client.sessions),
    String(client.progressPct),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function ClientsView() {
  const searchParams = useSearchParams();
  const { clients: rows, loading, error } = useTrainerClients();
  const [q, setQ] = useState(() => searchParams.get("q") ?? "");
  const [status, setStatus] = useState<"all" | TrainerClientDto["status"]>("all");
  const [mode, setMode] = useState<"table" | "grid">("table");

  useEffect(() => {
    const fromUrl = searchParams.get("q");
    if (fromUrl) deferEffect(() => setQ(fromUrl));
  }, [searchParams]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const okQ = clientMatchesQuery(r, q);
      const okS = status === "all" || r.status === status;
      return okQ && okS;
    });
  }, [rows, q, status]);

  const hasActiveSearch = normalizeQuery(q).length > 0;

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <motion.div
        className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="min-w-0 space-y-1">
          <h1 className="text-balance text-xl font-semibold tracking-tight min-[400px]:text-2xl">
            Clients
          </h1>
          <p className="text-sm text-muted-foreground">
            Clients who booked with you — from live session data.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, goal…"
              className="h-10 rounded-xl pl-9 pr-9"
              aria-label="Search clients"
            />
            {hasActiveSearch ? (
              <button
                type="button"
                onClick={() => setQ("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Clear search"
              >
                ✕
              </button>
            ) : null}
          </div>
          <div className="flex rounded-xl border border-border bg-muted/30 p-0.5">
            <Button
              type="button"
              size="sm"
              variant={mode === "table" ? "secondary" : "ghost"}
              className="gap-1.5 rounded-lg px-3"
              onClick={() => setMode("table")}
            >
              <Table2 className="size-4" aria-hidden />
              Table
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "grid" ? "secondary" : "ghost"}
              className="gap-1.5 rounded-lg px-3"
              onClick={() => setMode("grid")}
            >
              <LayoutGrid className="size-4" aria-hidden />
              Grid
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-2">
        {(["all", "active", "paused", "trial"] as const).map((s) => (
          <Button
            key={s}
            type="button"
            size="sm"
            variant={status === s ? "default" : "outline"}
            className="rounded-full capitalize"
            onClick={() => setStatus(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      <TrainerPlanBanner />

      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {loading ? (
        <LoadingPlaceholder minHeight="min-h-[14rem]" />
      ) : rows.length === 0 ? (
        <Card className="rounded-2xl border border-border/80 bg-muted/20 shadow-sm">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No clients yet. When someone books and you confirm a session, they appear here.
          </CardContent>
        </Card>
      ) : mode === "grid" ? (
        filtered.length === 0 ? (
          <Card className="rounded-2xl border border-border/80 bg-muted/20 shadow-sm">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              {hasActiveSearch
                ? `No clients match “${q.trim()}”.`
                : "No clients match your filters."}
            </CardContent>
          </Card>
        ) : (
        <motion.div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -2 }}
            >
              <Link
                href={`/clients/${r.id}`}
                className="block h-full rounded-2xl border border-border/80 bg-card/90 p-5 shadow-sm transition-shadow hover:border-primary/25 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <TrainerAvatar seed={r.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{r.name}</p>
                    <p className="text-sm text-muted-foreground">{r.goal}</p>
                    <span className={cn("mt-2", clientStatusBadgeMarkup(r.status))}>
                      {r.status}
                    </span>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Progress</p>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${r.progressPct}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                      {r.progressPct}%
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Next: <span className="font-medium text-foreground">{r.nextSession}</span>
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        )
      ) : (
        <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-sm backdrop-blur-sm">
          <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <CardTitle className="text-base">Directory</CardTitle>
                <CardDescription>
                  {hasActiveSearch
                    ? `${filtered.length} of ${rows.length} clients matching “${q.trim()}”`
                    : `${filtered.length} of ${rows.length} clients from your bookings`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                {hasActiveSearch
                  ? `No clients match “${q.trim()}”.`
                  : "No clients match your filters."}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/80 bg-muted/30 hover:bg-muted/30">
                    <TableHead className="h-11 pl-6 font-semibold text-foreground/80">
                      Client
                    </TableHead>
                    <TableHead className="hidden font-semibold text-foreground/80 md:table-cell">
                      Goal
                    </TableHead>
                    <TableHead className="hidden font-semibold text-foreground/80 sm:table-cell">
                      Sessions
                    </TableHead>
                    <TableHead className="min-w-[9rem] font-semibold text-foreground/80">
                      Progress
                    </TableHead>
                    <TableHead className="hidden font-semibold text-foreground/80 lg:table-cell">
                      Next session
                    </TableHead>
                    <TableHead className="font-semibold text-foreground/80">Status</TableHead>
                    <TableHead className="w-10 pr-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow
                      key={r.id}
                      className="group border-border/60 transition-colors hover:bg-primary/[0.03]"
                    >
                      <TableCell className="py-3.5 pl-6">
                        <Link
                          href={`/clients/${r.id}`}
                          className="flex items-center gap-3 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <TrainerAvatar seed={r.name} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground group-hover:text-primary">
                              {r.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">{r.email}</p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="hidden max-w-[12rem] py-3.5 md:table-cell">
                        <span className="line-clamp-2 text-sm text-muted-foreground">{r.goal}</span>
                      </TableCell>
                      <TableCell className="hidden py-3.5 tabular-nums text-muted-foreground sm:table-cell">
                        <span className="text-sm font-medium text-foreground">{r.sessions}</span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <div className="flex min-w-[7.5rem] max-w-[10rem] items-center gap-2.5">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${r.progressPct}%` }}
                            />
                          </div>
                          <span className="w-9 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
                            {r.progressPct}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap py-3.5 text-sm text-muted-foreground lg:table-cell">
                        {r.nextSession}
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className={clientStatusBadgeMarkup(r.status)}>
                          {r.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 pr-4 text-muted-foreground/50 group-hover:text-primary">
                        <Link
                          href={`/clients/${r.id}`}
                          className="inline-flex size-8 items-center justify-center rounded-lg transition-colors group-hover:bg-primary/10"
                          aria-label={`Open ${r.name}`}
                        >
                          <ChevronRight className="size-4" aria-hidden />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
