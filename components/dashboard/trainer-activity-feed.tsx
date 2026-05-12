"use client";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, Sparkles, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
const items = [
    { icon: CheckCircle2, label: "Casey Wu confirmed Tue 7:30 AM", time: "12 min ago" },
    { icon: UserPlus, label: "Trial booked — Riley Brooks", time: "1h ago" },
    { icon: Sparkles, label: "AI drafted reminder for Jordan Lee", time: "2h ago" },
    { icon: Activity, label: "Program updated for Alex Morgan", time: "Yesterday" },
] as const;
export function TrainerActivityFeed() {
    return (<Card className="rounded-2xl border border-border/80 bg-card/90 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base">Recent activity</CardTitle>
        <CardDescription>Live-style feed — wire webhooks or inbox later.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((it, i) => (<motion.div key={it.label} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5 text-sm">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
              <it.icon className="size-4" aria-hidden/>
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium leading-snug text-foreground">{it.label}</p>
              <p className="text-xs text-muted-foreground">{it.time}</p>
            </div>
          </motion.div>))}
      </CardContent>
    </Card>);
}
