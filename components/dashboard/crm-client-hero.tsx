"use client";

import Link from "next/link";
import { CalendarDays, Mail, Target } from "lucide-react";
import { TrainerAvatar } from "@/components/visual/trainer-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { clientStatusBadgeMarkup } from "@/lib/client-status-styles";
import type { TrainerClientDto } from "@/lib/trainer-portal-api";
import { cn } from "@/lib/utils";

export function CrmClientHero({
  client,
  attendancePct,
}: {
  client: TrainerClientDto;
  attendancePct?: number;
}) {
  return (
    <Card className="overflow-hidden rounded-2xl border-0 bg-card shadow-lg shadow-black/[0.04]">
      <div className="border-b border-border/30 bg-gradient-to-br from-teal-500/[0.1] via-card to-orange-500/[0.05] px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <TrainerAvatar
              seed={client.name}
              size="xl"
              className="ring-2 ring-white/90 shadow-md"
            />
            <div className="min-w-0 space-y-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700/90">
                  Client profile
                </p>
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {client.name}
                </h1>
              </div>
              {client.email ? (
                <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground/85">
                  <Mail className="size-3.5 shrink-0" aria-hidden />
                  {client.email}
                </p>
              ) : null}
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground/85">
                <Target className="size-3.5 shrink-0 text-teal-600" aria-hidden />
                {client.goal} · {client.sessions} sessions
              </p>
              <div className="flex flex-wrap gap-2">
                <span className={clientStatusBadgeMarkup(client.status)}>
                  {client.status}
                </span>
                <span className="inline-flex rounded-full bg-background/80 px-2.5 py-0.5 text-xs font-semibold text-foreground shadow-sm">
                  Next: {client.nextSession}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild size="sm" className="gap-2 rounded-xl shadow-sm">
              <Link href="/calendar">
                <CalendarDays className="size-4" aria-hidden />
                Calendar
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:max-w-md">
          {[
            { label: "Progress", value: `${client.progressPct}%` },
            { label: "Sessions", value: String(client.sessions) },
            {
              label: "Show rate",
              value: attendancePct != null ? `${attendancePct}%` : "—",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "rounded-xl bg-background/70 px-3 py-2.5 text-center shadow-sm",
              )}
            >
              <p className="text-lg font-bold tabular-nums text-foreground">
                {stat.value}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
