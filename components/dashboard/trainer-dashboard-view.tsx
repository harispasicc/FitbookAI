"use client";

import { Sparkles } from "lucide-react";
import { DashReveal } from "@/components/dashboard/dashboard-motion";
import { DashboardClientInsights } from "@/components/dashboard/dashboard-client-insights";
import { DashboardGrowthSection } from "@/components/dashboard/dashboard-growth-section";
import { DashboardKpiOverview } from "@/components/dashboard/dashboard-kpi-overview";
import { DashboardTodaySection } from "@/components/dashboard/dashboard-today-section";
import { DashboardUpcomingSessions } from "@/components/dashboard/dashboard-upcoming-sessions";
import { TrainerActivityFeed } from "@/components/dashboard/trainer-activity-feed";

export function TrainerDashboardView() {
  return (
    <div className="flex min-w-0 flex-col gap-5 md:gap-6">
      <header className="flex min-w-0 flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-balance text-xl font-bold tracking-tight min-[400px]:text-2xl">
              Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500/12 to-teal-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-700 shadow-sm">
              <Sparkles className="size-3.5" aria-hidden />
              AI Coach OS
            </span>
          </div>
          <p className="max-w-xl text-pretty text-sm font-medium text-muted-foreground/85">
            Operational workspace — sessions, revenue signals, and AI-powered client intelligence.
          </p>
        </div>
      </header>

      <DashReveal>
        <DashboardTodaySection />
      </DashReveal>
      <DashboardKpiOverview />

      <div className="grid min-w-0 items-start gap-5 lg:grid-cols-12 lg:gap-5">
        <div className="min-w-0 lg:col-span-8">
          <DashboardGrowthSection />
        </div>
        <div className="min-w-0 lg:col-span-4 lg:sticky lg:top-6">
          <DashboardUpcomingSessions compact />
        </div>
      </div>

      <TrainerActivityFeed />

      <DashboardClientInsights />
    </div>
  );
}
