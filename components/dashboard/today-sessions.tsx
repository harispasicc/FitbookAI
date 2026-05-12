"use client";
import { TrainerAvatar } from "@/components/visual/trainer-avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDemoData } from "@/hooks/use-demo-data";
const defaultTimes = ["07:30", "09:00", "17:30"];
export function TodaySessions() {
    const { data } = useDemoData();
    const slice = data?.bookings?.slice(0, 3) ?? [];
    const sessions = slice.length > 0
        ? slice.map((b, i) => {
            const time = b.slotIso && !Number.isNaN(new Date(b.slotIso).getTime())
                ? new Date(b.slotIso).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                })
                : defaultTimes[i % defaultTimes.length];
            return {
                time,
                client: b.guest,
                type: b.service,
            };
        })
        : [
            { time: "07:30", client: "Alex Morgan", type: "Strength — lower" },
            { time: "09:00", client: "Jordan Lee", type: "HIIT" },
            { time: "17:30", client: "Sam Rivera", type: "Mobility" },
        ];
    return (<Card className="rounded-2xl border border-border/80 bg-card/90 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-base">Today</CardTitle>
        <CardDescription>Next sessions — sample data after sign up.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.map((s) => (<div key={`${s.time}-${s.client}`} className="flex items-center gap-3 rounded-xl border border-border/60 bg-gradient-to-r from-muted/30 to-transparent px-3 py-2.5 text-sm shadow-sm">
            <span className="font-mono text-xs tabular-nums text-muted-foreground">{s.time}</span>
            <TrainerAvatar seed={s.client} size="sm" className="shrink-0"/>
            <div className="min-w-0 flex-1 text-right">
              <p className="truncate font-medium">{s.client}</p>
              <p className="truncate text-xs text-muted-foreground">{s.type}</p>
            </div>
          </div>))}
      </CardContent>
    </Card>);
}
