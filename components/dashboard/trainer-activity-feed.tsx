"use client";

import { motion } from "framer-motion";
import { Activity, CheckCircle2, UserPlus } from "lucide-react";
import { BusyDots } from "@/components/ui/busy-dots";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrainerAnalytics } from "@/hooks/use-trainer-workspace";

function iconForLabel(label: string) {
  if (label.includes("confirmed")) return CheckCircle2;
  if (label.includes("booked")) return UserPlus;
  return Activity;
}

export function TrainerActivityFeed() {
  const { analytics, loading } = useTrainerAnalytics();
  const items = analytics?.recentActivity ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent activity</CardTitle>
        <CardDescription>Latest booking updates from your workspace.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && items.length === 0 ? (
          <div className="flex justify-center py-6">
            <BusyDots size="sm" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            compact
            icon={Activity}
            title="No booking activity yet"
            description="When clients book or you confirm sessions, updates appear here."
          />
        ) : (
          items.map((it, i) => {
            const Icon = iconForLabel(it.label);
            return (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5 text-sm"
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug text-foreground">{it.label}</p>
                  <p className="text-xs text-muted-foreground">{it.time}</p>
                </div>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
