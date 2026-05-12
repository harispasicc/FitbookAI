"use client";
import { motion } from "framer-motion";
import { CalendarCheck, CreditCard, Percent, Sparkles, Users } from "lucide-react";
import { Sparkline } from "@/components/visual/sparkline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDemoData } from "@/hooks/use-demo-data";
function fmtMoney(n: number) {
    return `$${n.toLocaleString("en-US")}`;
}
export function StatCards() {
    const { data } = useDemoData();
    const a = data?.analytics;
    const stats = [
        {
            title: "Revenue (30d)",
            value: a ? fmtMoney(a.revenue30d) : "—",
            hint: a ? "From your saved workspace" : "Sign up to populate sample totals",
            icon: CreditCard,
            series: [8200, 9100, 8800, 10200, 10800, 11200, 11800, 12480],
            stroke: "stroke-teal-600",
            gid: "dash-sp-rev",
        },
        {
            title: "Bookings",
            value: a ? String(a.bookingsCount) : "—",
            hint: a ? "Last 30 days (sample)" : "—",
            icon: CalendarCheck,
            series: [140, 152, 148, 162, 170, 175, 180, 186],
            stroke: "stroke-orange-500",
            gid: "dash-sp-book",
        },
        {
            title: "Active clients",
            value: a ? String(a.activeClients) : "—",
            hint: a ? "From your client list" : "—",
            icon: Users,
            series: [3, 4, 4, 4, 5, 5, 5, 5],
            stroke: "stroke-teal-500",
            gid: "dash-sp-cli",
        },
        {
            title: "Retention",
            value: a ? `${a.retentionPct}%` : "—",
            hint: a ? "Snapshot KPI" : "—",
            icon: Percent,
            series: [78, 80, 81, 83, 84, 86, 87, 88],
            stroke: "stroke-orange-500",
            gid: "dash-sp-ret",
        },
        {
            title: "AI reminders",
            value: a ? String(a.aiRemindersGenerated) : "—",
            hint: a ? "Drafted nudges & follow-ups" : "—",
            icon: Sparkles,
            series: [12, 18, 22, 28, 34, 40, 48, 56],
            stroke: "stroke-teal-600",
            gid: "dash-sp-ai",
        },
    ] as const;
    return (<div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5">
      {stats.map(({ title, value, hint, icon: Icon, series, stroke, gid }) => (<motion.div key={title} whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 420, damping: 28 }}>
          <Card className="h-full rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-teal-500/[0.04] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <span className="flex size-8 items-center justify-center rounded-xl border border-border/80 bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm">
              <Icon className="size-4" aria-hidden/>
            </span>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
            <div className="flex items-end justify-between gap-2">
              <p className="min-w-0 flex-1 text-xs text-muted-foreground">{hint}</p>
              <Sparkline values={series} strokeClassName={stroke} gradientId={gid} className="shrink-0 opacity-95"/>
            </div>
          </CardContent>
        </Card>
        </motion.div>))}
    </div>);
}
