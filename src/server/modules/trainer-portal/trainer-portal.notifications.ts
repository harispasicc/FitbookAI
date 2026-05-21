import type { BookingDto } from "@/server/modules/bookings/bookings.dto";

export type TrainerNotificationTone = "info" | "success" | "warning" | "neutral";

export type TrainerNotificationDto = {
  id: string;
  title: string;
  body: string;
  tone: TrainerNotificationTone;
  timeLabel: string;
  createdAt: string;
  href: string;
};

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
}

function formatSessionWhen(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function notificationForBooking(booking: BookingDto): TrainerNotificationDto | null {
  const when = formatSessionWhen(booking.startsAt);
  const client = booking.client.name;
  const service = booking.service.title;
  const href = "/calendar";

  if (booking.status === "pending") {
    const at = new Date(booking.createdAt);
    return {
      id: `booking-${booking.id}-pending`,
      title: "New booking request",
      body: `${client} · ${service} · ${when}`,
      tone: "warning",
      timeLabel: formatRelativeTime(at),
      createdAt: at.toISOString(),
      href,
    };
  }

  if (booking.status === "cancelled") {
    const at = new Date(booking.updatedAt);
    const ageMs = Date.now() - at.getTime();
    if (ageMs > 30 * 24 * 60 * 60 * 1000) return null;
    return {
      id: `booking-${booking.id}-cancelled`,
      title: "Booking cancelled",
      body: `${client} · ${service}`,
      tone: "neutral",
      timeLabel: formatRelativeTime(at),
      createdAt: at.toISOString(),
      href,
    };
  }

  if (booking.status === "confirmed") {
    const starts = new Date(booking.startsAt);
    if (starts.getTime() > Date.now()) {
      return {
        id: `booking-${booking.id}-upcoming`,
        title: "Upcoming session",
        body: `${client} · ${service} · ${when}`,
        tone: "info",
        timeLabel: formatRelativeTime(starts),
        createdAt: starts.toISOString(),
        href,
      };
    }
    const updated = new Date(booking.updatedAt);
    const ageMs = Date.now() - updated.getTime();
    if (ageMs <= 14 * 24 * 60 * 60 * 1000) {
      return {
        id: `booking-${booking.id}-confirmed`,
        title: "Booking confirmed",
        body: `${client} · ${service} · ${when}`,
        tone: "success",
        timeLabel: formatRelativeTime(updated),
        createdAt: updated.toISOString(),
        href,
      };
    }
  }

  if (booking.status === "completed") {
    const ends = new Date(booking.endsAt);
    const ageMs = Date.now() - ends.getTime();
    if (ageMs > 14 * 24 * 60 * 60 * 1000) return null;
    return {
      id: `booking-${booking.id}-completed`,
      title: "Session completed",
      body: `${client} · ${service}`,
      tone: "success",
      timeLabel: formatRelativeTime(ends),
      createdAt: ends.toISOString(),
      href,
    };
  }

  return null;
}

export function buildTrainerNotifications(
  bookings: BookingDto[],
): TrainerNotificationDto[] {
  const cutoff = Date.now() - 60 * 24 * 60 * 60 * 1000;

  return bookings
    .filter((b) => new Date(b.updatedAt).getTime() >= cutoff)
    .map(notificationForBooking)
    .filter((n): n is TrainerNotificationDto => n !== null)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 30);
}
