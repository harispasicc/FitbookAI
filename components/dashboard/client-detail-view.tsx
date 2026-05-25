"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, LineChart, Sparkles, Target, UtensilsCrossed, } from "lucide-react";
import { BusyDots } from "@/components/ui/busy-dots";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CrmClientHero } from "@/components/dashboard/crm-client-hero";
import { ProfileQuickLinks } from "@/components/dashboard/profile-page-shell";
import { BOOKINGS_UPDATE_EVENT } from "@/lib/demo-data-events";
import { fitnessImages } from "@/lib/media-urls";
import { bookingDtoToRow } from "@/lib/map-booking-to-row";
import {
  apiGetTrainerClient,
  apiPatchTrainerClientNotes,
  type TrainerClientDto,
} from "@/lib/trainer-portal-api";
import type { BookingRow } from "@/lib/mock-bookings";
const tabs = ["Overview", "Sessions", "Notes"] as const;
type Tab = (typeof tabs)[number];
export function ClientDetailView() {
    const params = useParams();
    const id = typeof params?.id === "string" ? params.id : "";
    const [tab, setTab] = useState<Tab>("Overview");
    const [client, setClient] = useState<TrainerClientDto | null>(null);
    const [sessionRows, setSessionRows] = useState<BookingRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notesDraft, setNotesDraft] = useState("");
    const [notesSaving, setNotesSaving] = useState(false);
    const [attendance, setAttendance] = useState({ showRatePct: 0, completed: 0, total: 0 });
    const [workoutCount, setWorkoutCount] = useState(0);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const detail = await apiGetTrainerClient(id);
                if (cancelled) return;
                setClient(detail.client);
                setNotesDraft(detail.client.notes);
                setAttendance(detail.attendance);
                setWorkoutCount(detail.workoutCount);
                setSessionRows(
                    detail.bookings.map((b) => bookingDtoToRow(b, "trainer")),
                );
            } catch (e) {
                if (cancelled) return;
                setClient(null);
                setSessionRows([]);
                setError(e instanceof Error ? e.message : "Failed to load client");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void load();
        function onUpdate() {
            void load();
        }
        window.addEventListener(BOOKINGS_UPDATE_EVENT, onUpdate);
        return () => {
            cancelled = true;
            window.removeEventListener(BOOKINGS_UPDATE_EVENT, onUpdate);
        };
    }, [id]);

    const sessionsForClient = useMemo(
        () => sessionRows.slice(0, 12),
        [sessionRows],
    );

    async function saveNotes() {
        if (!id) return;
        setNotesSaving(true);
        setError(null);
        try {
            const detail = await apiPatchTrainerClientNotes(id, notesDraft);
            setClient(detail.client);
            setNotesDraft(detail.client.notes);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to save notes");
        } finally {
            setNotesSaving(false);
        }
    }

    if (loading) {
        return (
          <div className="flex justify-center py-16">
            <BusyDots />
          </div>
        );
    }

    if (!client) {
        return (<div className="min-w-0 space-y-4">
        <Button asChild variant="ghost" size="sm" className="gap-1 px-0 text-muted-foreground hover:text-foreground">
          <Link href="/clients">
            <ArrowLeft className="size-4" aria-hidden/>
            Back to clients
          </Link>
        </Button>
        <Card className="rounded-2xl border border-border/80 bg-muted/20">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {error ?? "Client not found. They need at least one booking with you."}
          </CardContent>
        </Card>
      </div>);
    }
    return (<div className="min-w-0 space-y-6 sm:space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-1 px-0 text-muted-foreground hover:text-foreground">
          <Link href="/clients">
            <ArrowLeft className="size-4" aria-hidden/>
            Clients
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex min-w-0 flex-1 flex-col gap-6">
          <CrmClientHero client={client} attendancePct={attendance.showRatePct} />

          <div className="flex flex-wrap gap-2 border-b border-border pb-2">
            {tabs.map((t) => (<Button key={t} type="button" size="sm" variant={tab === t ? "default" : "ghost"} className="rounded-full" onClick={() => setTab(t)}>
                {t}
              </Button>))}
          </div>

          {tab === "Overview" ? (<div className="grid min-w-0 gap-4 lg:grid-cols-2">
              <Card className="rounded-2xl border border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <LineChart className="size-4 text-primary" aria-hidden/>
                    Weight trend
                  </CardTitle>
                  <CardDescription>Progress from goal completion on booked sessions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${client.progressPct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Estimated from completed sessions vs total bookings.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="size-4 text-primary" aria-hidden/>
                    Goals
                  </CardTitle>
                  <CardDescription>Primary focus for this block.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-xs font-medium text-muted-foreground">
                      <span>Block progress</span>
                      <span className="tabular-nums text-foreground">{client.progressPct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${client.progressPct}%` }}/>
                    </div>
                  </div>
                  <p className="text-sm text-foreground">{client.goal}</p>
                  <p className="text-sm text-muted-foreground">{client.notes}</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-border/80 shadow-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="size-4 text-primary" aria-hidden/>
                    AI suggestions
                  </CardTitle>
                  <CardDescription>Generated coaching prompts. No model calls in this build.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {[
                "Deload upper pressing 10% if sleep score <70 two nights in a row.",
                "Swap Thursday HIIT for Zone 2 if HRV trending down.",
                "Send a check-in after the third missed mobility day.",
            ].map((s) => (<div key={s} className="rounded-xl border border-border/70 bg-muted/20 p-3 text-sm text-foreground">
                      {s}
                    </div>))}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UtensilsCrossed className="size-4 text-muted-foreground" aria-hidden/>
                    Nutrition summary
                  </CardTitle>
                  <CardDescription>Nutrition tracking is not enabled in this build.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Protein target hit 5/7 days · hydration reminders enabled.</p>
                  <Separator />
                  <p className="text-xs">Wire Cronometer / MyFitnessPal or custom food logs.</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Camera className="size-4 text-muted-foreground" aria-hidden/>
                    Progress photos
                  </CardTitle>
                  <CardDescription>Front, side, and back. Client uploads.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2">
                  {[fitnessImages.stretch, fitnessImages.track, fitnessImages.dumbbells].map((src, i) => (<div key={i} className="relative aspect-[3/4] overflow-hidden rounded-lg border border-border bg-muted">
                      <Image src={src} alt="" fill className="object-cover opacity-80" sizes="120px"/>
                    </div>))}
                </CardContent>
              </Card>
            </div>) : null}

          {tab === "Sessions" ? (<Card className="rounded-2xl border border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Recent sessions</CardTitle>
                <CardDescription>Bookings where the guest name matches this client.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sessionsForClient.length === 0 ? (<p className="text-sm text-muted-foreground">No sessions with this client yet.</p>) : (<ul className="space-y-2">
                    {sessionsForClient.map((b) => (<li key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/15 px-3 py-2 text-sm">
                        <span className="font-medium text-foreground">{b.service}</span>
                        <span className="text-xs text-muted-foreground">
                          {b.slotIso
                        ? new Date(b.slotIso).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                        })
                        : b.date}
                        </span>
                        <span className="rounded-full bg-background px-2 py-0.5 text-xs capitalize text-foreground ring-1 ring-border">
                          {b.status}
                        </span>
                      </li>))}
                  </ul>)}
              </CardContent>
            </Card>) : null}

          {tab === "Notes" ? (<Card className="rounded-2xl border border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Coach notes</CardTitle>
                <CardDescription>Private CRM notes saved to your workspace.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={6}
                  placeholder="Session focus, injuries, preferences…"
                  className="flex w-full resize-y rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button
                  type="button"
                  size="sm"
                  className="rounded-xl"
                  disabled={notesSaving}
                  onClick={() => void saveNotes()}
                >
                  {notesSaving ? <BusyDots size="sm" className="mr-2" /> : null}
                  Save notes
                </Button>
                <Separator />
                <p className="text-muted-foreground">
                  Last touchpoint: <span className="font-medium text-foreground">{client.lastSession}</span>
                </p>
              </CardContent>
            </Card>) : null}
        </motion.div>

        <aside className="w-full shrink-0 space-y-4 lg:w-72">
          <ProfileQuickLinks
            links={[
              { href: "/calendar", label: "Calendar" },
              { href: "/clients", label: "All clients" },
              { href: "/ai", label: "AI Assistant" },
            ]}
            hint="Notes and session history stay in this workspace."
          />
          <Card className="rounded-2xl border-0 bg-muted/25 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>4-week show rate</span>
                <span className="font-medium tabular-nums text-foreground">{attendance.showRatePct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500/80"
                  style={{ width: `${attendance.showRatePct}%` }}
                />
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-0 bg-muted/25 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Workout summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                {workoutCount} logged workout{workoutCount === 1 ? "" : "s"} in the client portal.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>);
}
