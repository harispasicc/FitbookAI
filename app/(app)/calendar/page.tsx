import type { Metadata } from "next";
import { CalendarPageContent } from "@/components/dashboard/calendar-page-content";

export const metadata: Metadata = {
  title: "Calendar",
};

export default function CalendarPage() {
  return <CalendarPageContent />;
}
