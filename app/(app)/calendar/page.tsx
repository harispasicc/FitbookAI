import type { Metadata } from "next";
import { BookingsTable } from "@/components/dashboard/bookings-table";
import { WeeklyCalendarView } from "@/components/dashboard/weekly-calendar-view";
export const metadata: Metadata = {
    title: "Calendar",
};
export default function CalendarPage() {
    return (<div className="min-w-0 space-y-6 sm:space-y-8">
      <div className="min-w-0 space-y-1">
        <h1 className="text-balance text-xl font-semibold tracking-tight min-[400px]:text-2xl">Calendar & bookings</h1>
        <p className="text-sm text-muted-foreground">
          Weekly agenda, session statuses, and coach availability — extend with real scheduling APIs.
        </p>
      </div>
      <WeeklyCalendarView />
      <BookingsTable />
    </div>);
}
