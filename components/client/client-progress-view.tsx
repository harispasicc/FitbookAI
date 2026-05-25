"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Dumbbell, Pencil, SearchX } from "lucide-react";
import { LoadingPlaceholder } from "@/components/ui/busy-dots";
import {
  apiGetClientGoals,
  apiGetClientWorkouts,
  apiPatchClientGoals,
  goalsDtoToState,
} from "@/lib/client-portal-api";
import {
  CLIENT_PORTAL_UPDATE_EVENT,
  notifyClientPortalUpdated,
} from "@/lib/demo-data-events";
import type { WorkoutHistoryRow } from "@/lib/client-mocks";
import { EmptyState } from "@/components/ui/empty-state";
import {
  defaultClientGoals,
  type ClientGoalsState,
  type GoalKey,
} from "@/lib/client-goals-storage";
import { ClientAiAssistantPanelLazy } from "@/components/client/client-ai-assistant-panel-lazy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deferEffect } from "@/lib/defer-effect";
import { productUi, productPageHeader } from "@/lib/product-ui";
import { clientCard } from "@/lib/client-surfaces";
import { cn } from "@/lib/utils";

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
  const [workouts, setWorkouts] = useState<WorkoutHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [edit, setEdit] = useState<GoalKey | null>(null);
  const [draftPct, setDraftPct] = useState("68");
  const [draftNote, setDraftNote] = useState("");
  const [draftActive, setDraftActive] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [goalsDto, workoutRows] = await Promise.all([
        apiGetClientGoals(),
        apiGetClientWorkouts(),
      ]);
      setGoals(goalsDtoToState(goalsDto));
      setWorkouts(workoutRows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load progress");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    deferEffect(() => void refresh());
  }, [refresh]);

  useEffect(() => {
    function onUpdate() {
      void refresh();
    }
    window.addEventListener(CLIENT_PORTAL_UPDATE_EVENT, onUpdate);
    return () => window.removeEventListener(CLIENT_PORTAL_UPDATE_EVENT, onUpdate);
  }, [refresh]);

  const persist = useCallback(
    async (next: ClientGoalsState, options?: { saveNotes?: boolean }) => {
      setGoals(next);
      try {
        await apiPatchClientGoals({
          active: next.active,
          pct: next.pct,
          ...(options?.saveNotes ? { notes: next.notes } : {}),
        });
        notifyClientPortalUpdated();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save goals");
        void refresh();
      }
    },
    [refresh],
  );

  const filteredWorkouts = useMemo(() => {
    if (typeFilter === "all") return workouts;
    const needle = typeFilter.toLowerCase();
    return workouts.filter((w) => w.type.toLowerCase().includes(needle));
  }, [workouts, typeFilter]);
  const activeMeta = goalMeta.find((g) => g.key === goals.active)!;

  return (
    <div className="min-w-0 space-y-8">
      <div className={productPageHeader()}>
        <h1 className={productUi.pageTitle}>Progress</h1>
        <p className={productUi.pageLead}>
          Goals, workout history, and completion synced to your FitBook account.
        </p>
      </div>

      <ClientAiAssistantPanelLazy variant="compact" />

      {loading ? (
        <LoadingPlaceholder minHeight="min-h-[6rem]" className="border-0 bg-transparent" />
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <section className="space-y-4">
        <motion.div
          className="flex items-center justify-between gap-2"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Goals</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              One active focus at a time. Tap a card or use Edit.
            </p>
          </div>
        </motion.div>
        <div className="grid gap-3 sm:grid-cols-2">
          {goalMeta.map((g, i) => {
            const selected = goals.active === g.key;
            const pct = goals.pct[g.key];
            return (
              <motion.div
                key={g.key}
                role="group"
                tabIndex={0}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  "cursor-pointer touch-manipulation rounded-2xl border-0 p-4 text-left shadow-sm outline-none transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  selected
                    ? "bg-gradient-to-br from-teal-500/10 to-violet-500/8 ring-2 ring-teal-500/20 shadow-md"
                    : "bg-card shadow-sm",
                )}
                onClick={() => void persist({ ...goals, active: g.key })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    void persist({ ...goals, active: g.key });
                  }
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">{g.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {goals.notes[g.key]?.trim() || g.blurb}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8 shrink-0"
                    aria-label={`Edit ${g.label} progress`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEdit(g.key);
                      setDraftPct(String(goals.pct[g.key]));
                      setDraftNote(goals.notes[g.key] ?? "");
                      setDraftActive(goals.active === g.key);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-xs font-medium text-muted-foreground">
                    <span>{selected ? "Active focus" : "Tap to activate"}</span>
                    <span className="tabular-nums text-foreground">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={false}
                      animate={{ width: `${pct}%` }}
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        {edit ? (
          <Card className={clientCard.panel}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Edit goal</CardTitle>
              <CardDescription>
                {goalMeta.find((x) => x.key === edit)?.label}: update progress, your personal
                target, or active focus.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="goal-pct" className="text-xs font-medium text-muted-foreground">
                    Completion %
                  </label>
                  <Input
                    id="goal-pct"
                    inputMode="numeric"
                    className="h-10 w-full rounded-xl"
                    value={draftPct}
                    onChange={(e) => setDraftPct(e.target.value.replace(/[^\d]/g, ""))}
                  />
                </div>
                <div className="flex items-end sm:pt-5">
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="active-goal"
                      className="size-4 border-input accent-primary"
                      checked={draftActive}
                      onChange={() => setDraftActive(true)}
                    />
                    Set as active focus (only one at a time)
                  </label>
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="goal-note" className="text-xs font-medium text-muted-foreground">
                  Your target (optional)
                </label>
                <textarea
                  id="goal-note"
                  rows={3}
                  placeholder={
                    goalMeta.find((x) => x.key === edit)?.blurb ??
                    "What does success look like for you?"
                  }
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                  className="flex w-full resize-y rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <p className="text-xs text-muted-foreground">
                  Replaces the default description on this card. Leave empty to use the template
                  text.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const n = Math.min(100, Math.max(0, Number(draftPct) || 0));
                    void persist(
                      {
                        ...goals,
                        active: draftActive ? edit : goals.active,
                        pct: { ...goals.pct, [edit]: n },
                        notes: { ...goals.notes, [edit]: draftNote.trim() },
                      },
                      { saveNotes: true },
                    );
                    setEdit(null);
                  }}
                >
                  Save
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setEdit(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
        <Card className={clientCard.panelAccent}>
          <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Current active goal
              </p>
              <p className="text-lg font-semibold text-foreground">{activeMeta.label}</p>
              <p className="text-sm text-muted-foreground">
                {goals.notes[goals.active]?.trim() || activeMeta.blurb}
              </p>
            </div>
            <p className="text-3xl font-semibold tabular-nums text-primary">{goals.pct[goals.active]}%</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Workout history
          </h2>
          <div className="flex flex-wrap gap-2">
            {["all", "strength", "conditioning", "mobility"].map((f) => (
              <Button
                key={f}
                type="button"
                size="sm"
                variant={typeFilter === f ? "secondary" : "outline"}
                className="h-8 rounded-full capitalize"
                onClick={() => setTypeFilter(f)}
              >
                {f}
              </Button>
            ))}
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Dumbbell className="size-4 text-primary" aria-hidden />
              Logged sessions
            </CardTitle>
            <CardDescription>From your FitBook workout log.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            {filteredWorkouts.length === 0 ? (
              <div className="px-4 pb-6 sm:px-6">
                {workouts.length === 0 ? (
                  <EmptyState
                    compact
                    icon={Dumbbell}
                    title="No workouts logged yet"
                    description="Sessions you complete with your coach will appear here. Check back after your next training."
                  />
                ) : (
                  <EmptyState
                    compact
                    icon={SearchX}
                    title="No workouts match this filter"
                    description="Try another category or show all logged sessions."
                  >
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="min-h-9"
                      onClick={() => setTypeFilter("all")}
                    >
                      Show all
                    </Button>
                  </EmptyState>
                )}
              </div>
            ) : (
              <>
                <ul className="space-y-3 px-4 pb-4 md:hidden">
                  {filteredWorkouts.map((w) => (
                    <li
                      key={w.id}
                      className={cn(clientCard.listItem, "p-4")}
                    >
                      <p className="text-sm font-medium text-foreground">{w.type}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{w.date}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm tabular-nums text-muted-foreground">
                        <span>{w.durationMin} min</span>
                        <span>{w.calories} kcal</span>
                      </div>
                      {w.trainerNote ? (
                        <p className="mt-2 text-sm text-muted-foreground">{w.trainerNote}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <div className="hidden overflow-x-auto md:block">
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
                    {filteredWorkouts.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{w.date}</TableCell>
                        <TableCell className="font-medium text-foreground">{w.type}</TableCell>
                        <TableCell className="tabular-nums text-muted-foreground">
                          {w.durationMin} min
                        </TableCell>
                        <TableCell className="tabular-nums text-muted-foreground">{w.calories}</TableCell>
                        <TableCell className="hidden max-w-[280px] text-muted-foreground md:table-cell">
                          {w.trainerNote}
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
      </section>

      <p className="text-sm text-muted-foreground">
        <Link href="/me" className="font-medium text-primary underline-offset-4 hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
