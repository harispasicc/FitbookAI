import type { BookingDto } from "@/server/modules/bookings/bookings.dto";
import type { TrainerClientSummary } from "@/server/modules/trainer-portal/trainer-portal.insights";
import type { toTrainerServiceDto } from "@/server/modules/trainer-portal/trainer-portal.dto";

type TrainerServiceDto = ReturnType<typeof toTrainerServiceDto>;

export type TrainerSearchItemDto = {
  id: string;
  type: "client" | "booking" | "service" | "page";
  title: string;
  subtitle: string | null;
  href: string;
};

export type TrainerSearchResponseDto = {
  query: string;
  clients: TrainerSearchItemDto[];
  bookings: TrainerSearchItemDto[];
  services: TrainerSearchItemDto[];
  pages: TrainerSearchItemDto[];
};

const TRAINER_NAV_PAGES: {
  id: string;
  title: string;
  href: string;
  keywords: string[];
}[] = [
  { id: "dashboard", title: "Dashboard", href: "/dashboard", keywords: ["dashboard", "home", "overview"] },
  { id: "calendar", title: "Calendar", href: "/calendar", keywords: ["calendar", "bookings", "sessions", "schedule"] },
  { id: "clients", title: "Clients", href: "/clients", keywords: ["clients", "people", "members"] },
  { id: "services", title: "Services", href: "/services", keywords: ["services", "offerings", "packages"] },
  { id: "analytics", title: "Analytics", href: "/analytics", keywords: ["analytics", "stats", "revenue", "metrics"] },
  { id: "ai", title: "AI Assistant", href: "/ai", keywords: ["ai", "assistant", "chat"] },
  { id: "settings", title: "Settings", href: "/settings", keywords: ["settings", "availability", "notifications"] },
  { id: "profile", title: "Profile", href: "/profile", keywords: ["profile", "bio", "specialty"] },
];

function normalizeQuery(q: string) {
  return q.trim().toLowerCase();
}

function matchesQuery(q: string, ...parts: (string | null | undefined)[]) {
  return parts.some((p) => p && p.toLowerCase().includes(q));
}

function formatBookingWhen(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function perGroupLimit(totalLimit: number) {
  return Math.max(3, Math.ceil(totalLimit / 4));
}

export function buildTrainerSearchResults(input: {
  query: string;
  limit: number;
  clients: TrainerClientSummary[];
  services: TrainerServiceDto[];
  bookings: BookingDto[];
}): TrainerSearchResponseDto {
  const q = normalizeQuery(input.query);
  const cap = perGroupLimit(input.limit);

  const clients = input.clients
    .filter((c) => matchesQuery(q, c.name, c.email, c.goal, c.notes))
    .slice(0, cap)
    .map(
      (c): TrainerSearchItemDto => ({
        id: c.id,
        type: "client",
        title: c.name,
        subtitle: [c.goal, c.email].filter(Boolean).join(" · ") || null,
        href: `/clients/${c.id}`,
      }),
    );

  const services = input.services
    .filter((s) => matchesQuery(q, s.title, s.description))
    .slice(0, cap)
    .map(
      (s): TrainerSearchItemDto => ({
        id: s.id,
        type: "service",
        title: s.title,
        subtitle: `${s.durationMinutes} min · ${s.priceLabel}`,
        href: "/services",
      }),
    );

  const bookings = input.bookings
    .filter((b) =>
      matchesQuery(
        q,
        b.client.name,
        b.client.email,
        b.service.title,
        b.status,
        b.notes,
        formatBookingWhen(b.startsAt),
      ),
    )
    .slice(0, cap)
    .map(
      (b): TrainerSearchItemDto => ({
        id: b.id,
        type: "booking",
        title: `${b.client.name} — ${b.service.title}`,
        subtitle: `${formatBookingWhen(b.startsAt)} · ${b.status}`,
        href: "/calendar",
      }),
    );

  const pages = TRAINER_NAV_PAGES.filter(
    (p) => matchesQuery(q, p.title, ...p.keywords),
  )
    .slice(0, cap)
    .map(
      (p): TrainerSearchItemDto => ({
        id: p.id,
        type: "page",
        title: p.title,
        subtitle: null,
        href: p.href,
      }),
    );

  return { query: input.query.trim(), clients, bookings, services, pages };
}
