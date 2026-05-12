"use client";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { BookingsTable } from "@/components/dashboard/bookings-table";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { StatCards } from "@/components/dashboard/stat-cards";
import { TodaySessions } from "@/components/dashboard/today-sessions";
import { TrainerActivityFeed } from "@/components/dashboard/trainer-activity-feed";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
function ChartPlaceholder({ title, subtitle }: {
    title: string;
    subtitle: string;
}) {
    return (<motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}>
      <Card className="h-full rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-orange-500/[0.03] shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <BarChart3 className="size-4 text-muted-foreground" aria-hidden/>
            {title}
          </CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-36 items-end justify-between gap-1 rounded-xl border border-dashed border-border/80 bg-muted/20 px-3 pb-2 pt-4">
            {[40, 55, 48, 72, 64, 80, 58, 88].map((h, i) => (<div key={i} className="w-full max-w-[12%] rounded-t-md bg-primary/25 transition-colors hover:bg-primary/40" style={{ height: `${h}%` }}/>))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Chart library placeholder — drop in Recharts or Tremor.</p>
        </CardContent>
      </Card>
    </motion.div>);
}
export function TrainerDashboardView() {
    return (<div className="flex min-w-0 flex-col gap-6 sm:gap-8 md:gap-10">
      <div className="min-w-0 space-y-1">
        <h1 className="text-balance text-xl font-semibold tracking-tight min-[400px]:text-2xl">Dashboard</h1>
        <p className="text-pretty text-sm text-muted-foreground">
          Revenue, retention, and session rhythm — a calm ops view for a coaching studio.
        </p>
      </div>

      <StatCards />

      <div className="grid min-w-0 gap-4 md:grid-cols-2 lg:gap-6">
        <ChartPlaceholder title="Revenue trend" subtitle="Last 12 weeks — MRR vs one-off sessions."/>
        <ChartPlaceholder title="Client load" subtitle="Active vs paused — capacity planning."/>
      </div>

      <div className="grid min-w-0 gap-6 md:gap-8 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <TodaySessions />
          <BookingsTable />
        </div>
        <div className="min-w-0 space-y-6">
          <QuickActions />
          <TrainerActivityFeed />
        </div>
      </div>
    </div>);
}
