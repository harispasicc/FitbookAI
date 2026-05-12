"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LayoutGrid, Search, Table2 } from "lucide-react";
import { TrainerAvatar } from "@/components/visual/trainer-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDemoData } from "@/hooks/use-demo-data";
import { cn } from "@/lib/utils";
import type { DemoClient } from "@/lib/demo-types";
function statusBadge(status: DemoClient["status"]) {
    switch (status) {
        case "active":
            return "bg-emerald-500/10 text-emerald-900 ring-emerald-500/20";
        case "paused":
            return "bg-muted text-muted-foreground ring-border";
        case "trial":
            return "bg-orange-500/10 text-orange-900 ring-orange-500/25";
        default:
            return "bg-muted text-muted-foreground";
    }
}
export function ClientsView() {
    const { data } = useDemoData();
    const rows = data?.clients ?? [];
    const [q, setQ] = useState("");
    const [status, setStatus] = useState<"all" | DemoClient["status"]>("all");
    const [mode, setMode] = useState<"table" | "grid">("table");
    const filtered = useMemo(() => {
        return rows.filter((r) => {
            const okQ = !q.trim() ||
                r.name.toLowerCase().includes(q.toLowerCase()) ||
                r.goal.toLowerCase().includes(q.toLowerCase());
            const okS = status === "all" || r.status === status;
            return okQ && okS;
        });
    }, [rows, q, status]);
    return (<div className="min-w-0 space-y-6 sm:space-y-8">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-balance text-xl font-semibold tracking-tight min-[400px]:text-2xl">Clients</h1>
          <p className="text-sm text-muted-foreground">Search, filter, and open a coaching CRM profile for each client.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden/>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or goal…" className="h-10 rounded-xl pl-9" aria-label="Search clients"/>
          </div>
          <div className="flex rounded-xl border border-border bg-muted/30 p-0.5">
            <Button type="button" size="sm" variant={mode === "table" ? "secondary" : "ghost"} className="gap-1.5 rounded-lg px-3" onClick={() => setMode("table")}>
              <Table2 className="size-4" aria-hidden/>
              Table
            </Button>
            <Button type="button" size="sm" variant={mode === "grid" ? "secondary" : "ghost"} className="gap-1.5 rounded-lg px-3" onClick={() => setMode("grid")}>
              <LayoutGrid className="size-4" aria-hidden/>
              Grid
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "active", "paused", "trial"] as const).map((s) => (<Button key={s} type="button" size="sm" variant={status === s ? "default" : "outline"} className="rounded-full capitalize" onClick={() => setStatus(s)}>
            {s}
          </Button>))}
      </div>

      {rows.length === 0 ? (<Card className="rounded-2xl border border-border/80 bg-muted/20 shadow-sm">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Coach sign in and seed the workspace to load sample clients.
          </CardContent>
        </Card>) : mode === "grid" ? (<div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r, i) => (<motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} whileHover={{ y: -2 }}>
              <Link href={`/clients/${r.id}`} className="block h-full rounded-2xl border border-border/80 bg-card/90 p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-start gap-3">
                  <TrainerAvatar seed={r.name} size="md"/>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{r.name}</p>
                    <p className="text-sm text-muted-foreground">{r.goal}</p>
                    <span className={cn("mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1", statusBadge(r.status))}>
                      {r.status}
                    </span>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Progress</p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${r.progressPct}%` }}/>
                    </div>
                    <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">{r.progressPct}%</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Next: <span className="font-medium text-foreground">{r.nextSession}</span>
                  </p>
                </div>
              </Link>
            </motion.div>))}
        </div>) : (<Card className="rounded-2xl border border-border/80 bg-card/90 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Directory</CardTitle>
            <CardDescription>
              {filtered.length} of {rows.length} clients · saved in this browser for the demo.
            </CardDescription>
          </CardHeader>
          <CardContent className="-mx-1 overflow-x-auto overscroll-x-contain px-1 sm:mx-0 sm:px-0">
            {filtered.length === 0 ? (<p className="py-8 text-center text-sm text-muted-foreground">No clients match your filters.</p>) : (<table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-medium text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Client</th>
                    <th className="pb-2 pr-4 font-medium">Goal</th>
                    <th className="pb-2 pr-4 font-medium">Progress</th>
                    <th className="pb-2 pr-4 font-medium">Next session</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (<tr key={r.id} className="border-b border-border/70 last:border-0">
                      <td className="py-3 pr-4">
                        <Link href={`/clients/${r.id}`} className="group flex items-center gap-2.5 rounded-lg outline-none ring-offset-2 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary">
                          <TrainerAvatar seed={r.name} size="sm"/>
                          <span className="font-medium text-foreground underline-offset-4 group-hover:underline">{r.name}</span>
                        </Link>
                      </td>
                      <td className="max-w-[200px] truncate py-3 pr-4 text-muted-foreground">{r.goal}</td>
                      <td className="py-3 pr-4">
                        <div className="flex max-w-[140px] items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${r.progressPct}%` }}/>
                          </div>
                          <span className="shrink-0 tabular-nums text-xs text-muted-foreground">{r.progressPct}%</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{r.nextSession}</td>
                      <td className="py-3">
                        <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1", statusBadge(r.status))}>
                          {r.status}
                        </span>
                      </td>
                    </tr>))}
                </tbody>
              </table>)}
          </CardContent>
        </Card>)}
    </div>);
}
