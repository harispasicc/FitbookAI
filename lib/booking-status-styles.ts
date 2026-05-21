import type { BookingRow } from "@/lib/mock-bookings";
import { cn } from "@/lib/utils";

export function bookingStatusStyles(status: BookingRow["status"]) {
  switch (status) {
    case "confirmed":
      return cn(
        "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-400/50",
        "dark:bg-emerald-950 dark:text-emerald-100 dark:ring-emerald-700/50",
      );
    case "completed":
      return cn(
        "bg-green-600 text-white ring-1 ring-green-700/40",
        "dark:bg-green-700 dark:text-white dark:ring-green-600/50",
      );
    case "pending":
      return "bg-yellow-200 text-black ring-1 ring-yellow-400/70";
    case "cancelled":
      return cn(
        "bg-muted text-muted-foreground",
        "dark:bg-muted dark:text-muted-foreground",
      );
    default:
      return "";
  }
}

export function bookingStatusFilterClass(
  filter: "all" | BookingRow["status"],
  active: boolean,
) {
  if (!active) return "";

  switch (filter) {
    case "all":
      return "border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground";
    case "pending":
      return "border-yellow-400 bg-yellow-200 text-black hover:bg-yellow-300/90 hover:text-black";
    case "confirmed":
      return "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-700/90 hover:text-white";
    case "completed":
      return "border-green-700 bg-green-700 text-white hover:bg-green-700/90 hover:text-white";
    case "cancelled":
      return "border-muted-foreground/50 bg-muted-foreground text-background hover:bg-muted-foreground/90";
    default:
      return "";
  }
}

export function bookingStatusCalendarUsesLightText(status: BookingRow["status"]) {
  return status === "completed" || status === "confirmed";
}

export function bookingStatusCalendarClass(status: BookingRow["status"]) {
  switch (status) {
    case "confirmed":
      return cn(
        "border-emerald-700 bg-emerald-600 text-white",
        "dark:border-emerald-600 dark:bg-emerald-700 dark:text-white",
      );
    case "pending":
      return "border-yellow-400 bg-yellow-200 text-black";
    case "cancelled":
      return "border-border bg-muted/50 text-muted-foreground line-through";
    case "completed":
      return cn(
        "border-green-700 bg-green-600 text-white",
        "dark:border-green-600 dark:bg-green-700 dark:text-white",
      );
    default:
      return "border-border bg-card text-foreground";
  }
}
