"use client";

import { BookingsTable } from "@/components/dashboard/bookings-table";
import { PlanUpgradePrompt } from "@/components/dashboard/plan-upgrade-prompt";
import { WeeklyCalendarView } from "@/components/dashboard/weekly-calendar-view";
import { useTrainerPlan } from "@/hooks/use-trainer-plan";

export function CalendarPageContent() {
  const { canAccessFeature } = useTrainerPlan();
  const hasAdvancedCalendar = canAccessFeature("advancedCalendar");

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <div className="min-w-0 space-y-1">
        <h1 className="text-balance text-xl font-semibold tracking-tight min-[400px]:text-2xl">
          Calendar & bookings
        </h1>
        <p className="text-sm text-muted-foreground">
          {hasAdvancedCalendar
            ? "Weekly agenda, session statuses, and live bookings."
            : "Session list and statuses — upgrade for the week grid view."}
        </p>
      </div>

      {hasAdvancedCalendar ? (
        <WeeklyCalendarView />
      ) : (
        <PlanUpgradePrompt
          requiredPlan="pro"
          feature="advancedCalendar"
          title="Week view is a Pro feature"
          description="Free includes the bookings list below. Pro adds the weekly calendar grid and availability templates in Settings."
        />
      )}

      <BookingsTable />
    </div>
  );
}
