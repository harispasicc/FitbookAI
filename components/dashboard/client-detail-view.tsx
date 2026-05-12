"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, Camera, LineChart, MessageSquare, Sparkles, Target, UtensilsCrossed, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDemoData } from "@/hooks/use-demo-data";
import { TrainerAvatar } from "@/components/visual/trainer-avatar";
import { fitnessImages } from "@/lib/media-urls";
import { cn } from "@/lib/utils";
const tabs = ["Overview", "Sessions", "Notes"] as const;
type Tab = (typeof tabs)[number];
function WeightSparkline({ values }: {
    values: number[];
}) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const w = 200;
    const h = 72;
    const pts = values
        .map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const t = max === min ? 0.5 : (v - min) / (max - min);
        const y = h - t * (h - 8) - 4;
        return `${x},${y}`;
    })
        .join(" ");
    return (<svg viewBox={`0 0 ${w} ${h}`} className="h-20 w-full text-primary" aria-hidden>
      <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={pts} opacity={0.85}/>
    </svg>);
}
export function ClientDetailView() {
    const params = useParams();
    const id = typeof params?.id === "string" ? params.id : "";
    const { data } = useDemoData();
    const [tab, setTab] = useState<Tab>("Overview");
    const client = data?.clients.find((c) => c.id === id);
    const sessionsForClient = useMemo(() => {
        if (!client || !data?.bookings)
            return [];
        return data.bookings.filter((b) => b.guest === client.name).slice(0, 6);
    }, [client, data?.bookings]);
    const weightSeries = useMemo(() => {
        if (!client?.weightKg)
            return [78, 77.2, 76.8, 76.1, 75.4, 75.0];
        const base = client.weightKg;
        return [base + 1.8, base + 1.2, base + 0.6, base + 0.2, base - 0.1, base];
    }, [client?.weightKg]);
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
            Client not found in this browser&apos;s demo data.
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
          <Card className="rounded-2xl border border-border/80 bg-card/90 shadow-sm">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <TrainerAvatar seed={client.name} size="lg"/>
                <div className="min-w-0">
                  <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{client.name}</h1>
                  <p className="text-sm text-muted-foreground">{client.goal} · {client.sessions} sessions logged</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize", client.status === "active" && "bg-emerald-500/10 text-emerald-900", client.status === "paused" && "bg-muted text-muted-foreground", client.status === "trial" && "bg-orange-500/10 text-orange-900")}>
                      {client.status}
                    </span>
                    <span className="inline-flex rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium text-foreground">
                      Next: {client.nextSession}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" className="gap-2">
                  <MessageSquare className="size-4" aria-hidden/>
                  Message
                </Button>
                <Button type="button" size="sm" className="gap-2">
                  <CalendarDays className="size-4" aria-hidden/>
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>

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
                  <CardDescription>Demo series — connect scales or manual check-ins.</CardDescription>
                </CardHeader>
                <CardContent>
                  <WeightSparkline values={weightSeries}/>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Latest: <span className="font-medium text-foreground">{weightSeries[weightSeries.length - 1]} kg</span>
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
                  <CardDescription>Generated coaching prompts — no model calls in this build.</CardDescription>
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
                  <CardDescription>Placeholder — macros, adherence, meal photos.</CardDescription>
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
                  <CardDescription>Front / side / back — client uploads.</CardDescription>
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
                {sessionsForClient.length === 0 ? (<p className="text-sm text-muted-foreground">No matching bookings in demo data.</p>) : (<ul className="space-y-2">
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
                <CardDescription>Private CRM notes — demo text from seed data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>{client.notes}</p>
                <Separator />
                <p>
                  Last touchpoint: <span className="font-medium text-foreground">{client.lastSession}</span>
                </p>
              </CardContent>
            </Card>) : null}
        </motion.div>

        <aside className="w-full shrink-0 space-y-4 lg:w-72">
          <Card className="rounded-2xl border border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Attendance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>4-week show rate</span>
                <span className="font-medium tabular-nums text-foreground">92%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-[92%] rounded-full bg-emerald-500/80"/>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Workout summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Strength 3× · Conditioning 1× · Mobility 1× this week (demo).</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>);
}
