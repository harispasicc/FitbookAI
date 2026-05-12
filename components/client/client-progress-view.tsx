"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Dumbbell, Pencil, SlidersHorizontal } from "lucide-react";
import { MOCK_WORKOUT_HISTORY } from "@/lib/client-mocks";
import { ClientAiAssistantPanel } from "@/components/client/client-ai-assistant-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { defaultClientGoals, readClientGoals, writeClientGoals, type ClientGoalsState, type GoalKey, } from "@/lib/client-goals-storage";
const goalMeta: {
    key: GoalKey;
    label: string;
    blurb: string;
}[] = [
    { key: "lose", label: "Lose weight", blurb: "Calorie deficit + steps + strength preservation." },
    { key: "muscle", label: "Build muscle", blurb: "Progressive overload with recovery guardrails." },
    { key: "conditioning", label: "Improve conditioning", blurb: "Aerobic power + repeat sprint ability." },
    { key: "rehab", label: "Rehab / mobility", blurb: "Joint-friendly ranges and tissue tolerance." },
];
export function ClientProgressView() {
    const [goals, setGoals] = useState<ClientGoalsState>(defaultClientGoals);
    const [edit, setEdit] = useState<GoalKey | null>(null);
    const [draftPct, setDraftPct] = useState("68");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    useEffect(() => {
        setGoals(readClientGoals());
    }, []);
    const persist = useCallback((next: ClientGoalsState) => {
        setGoals(next);
        writeClientGoals(next);
    }, []);
    const workouts = useMemo(() => {
        const w = MOCK_WORKOUT_HISTORY;
        if (typeFilter === "all")
            return w;
        return w.filter((row) => row.type.toLowerCase().includes(typeFilter.toLowerCase()));
    }, [typeFilter]);
    const activeMeta = goalMeta.find((g) => g.key === goals.active)!;
    return (<div className="min-w-0 space-y-8">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Progress</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Goals, workout history, and completion — stored in your browser for this demo.
        </p>
      </div>

      <ClientAiAssistantPanel variant="compact"/>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Goals</h2>
          <SlidersHorizontal className="size-4 text-muted-foreground" aria-hidden/>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {goalMeta.map((g, i) => {
            const selected = goals.active === g.key;
            const pct = goals.pct[g.key];
            return (<motion.div key={g.key} role="group" tabIndex={0} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} aria-label={`${g.label} goal — ${selected ? "active" : "inactive"}. Press Enter or Space to set as active goal.`} aria-current={selected ? "true" : undefined} className={cn("cursor-pointer touch-manipulation rounded-2xl border p-4 text-left shadow-sm outline-none transition-all hover:border-primary/35 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", selected ? "border-primary bg-primary/5 ring-1 ring-primary/15" : "border-border bg-card")} onClick={() => persist({ ...goals, active: g.key })} onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        persist({ ...goals, active: g.key });
                    }
                }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">{g.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{g.blurb}</p>
                  </div>
                  <Button type="button" size="icon" variant="ghost" className="size-8 shrink-0" aria-label={`Edit ${g.label} progress`} onClick={(e) => {
                    e.stopPropagation();
                    setEdit(g.key);
                    setDraftPct(String(goals.pct[g.key]));
                }}>
                    <Pencil className="size-4"/>
                  </Button>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs font-medium text-muted-foreground">
                    <span>{selected ? "Active focus" : "Tap to activate"}</span>
                    <span className="tabular-nums text-foreground">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div className="h-full rounded-full bg-primary" initial={false} animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 300, damping: 28 }}/>
                  </div>
                </div>
              </motion.div>);
        })}
        </div>
        {edit ? (<Card className="rounded-2xl border border-border/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Edit completion</CardTitle>
              <CardDescription>Adjust percentage for {goalMeta.find((x) => x.key === edit)?.label}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label htmlFor="goal-pct" className="text-xs font-medium text-muted-foreground">
                  Completion %
                </label>
                <Input id="goal-pct" inputMode="numeric" className="h-10 w-28 rounded-xl" value={draftPct} onChange={(e) => setDraftPct(e.target.value.replace(/[^\d]/g, ""))}/>
              </div>
              <Button type="button" size="sm" onClick={() => {
                const n = Math.min(100, Math.max(0, Number(draftPct) || 0));
                persist({ ...goals, pct: { ...goals.pct, [edit]: n } });
                setEdit(null);
            }}>
                Save
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setEdit(null)}>
                Cancel
              </Button>
            </CardContent>
          </Card>) : null}
        <Card className="rounded-2xl border border-primary/20 bg-primary/[0.03]">
          <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Current active goal</p>
              <p className="text-lg font-semibold text-foreground">{activeMeta.label}</p>
              <p className="text-sm text-muted-foreground">{activeMeta.blurb}</p>
            </div>
            <p className="text-3xl font-semibold tabular-nums text-primary">{goals.pct[goals.active]}%</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Workout history</h2>
          <div className="flex flex-wrap gap-2">
            {["all", "strength", "conditioning", "mobility"].map((f) => (<Button key={f} type="button" size="sm" variant={typeFilter === f ? "secondary" : "outline"} className="h-8 rounded-full capitalize" onClick={() => setTypeFilter(f)}>
                {f}
              </Button>))}
          </div>
        </div>
        <Card className="rounded-2xl border border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Dumbbell className="size-4 text-primary" aria-hidden/>
              Logged sessions
            </CardTitle>
            <CardDescription>Demo rows — swap for wearable or gym check-in data.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="tabular-nums">Duration</TableHead>
                    <TableHead className="tabular-nums">Calories</TableHead>
                    <TableHead className="hidden md:table-cell">Coach notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workouts.map((w) => (<TableRow key={w.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{w.date}</TableCell>
                      <TableCell className="font-medium text-foreground">{w.type}</TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">{w.durationMin} min</TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">{w.calories}</TableCell>
                      <TableCell className="hidden max-w-[280px] text-muted-foreground md:table-cell">{w.trainerNote}</TableCell>
                    </TableRow>))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>

      <p className="text-sm text-muted-foreground">
        <Link href="/me" className="font-medium text-primary underline-offset-4 hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>);
}
