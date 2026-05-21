import type { BookingDto } from "@/lib/bookings-api";

import type { TrainerPlanFeatureKey, TrainerPlanId } from "@/lib/trainer-plans";

export type TrainerProfileDto = {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  specialty: string | null;
  bio: string | null;
  yearsExperience: number;
  plan: TrainerPlanId;
};

export type TrainerPlanContextDto = {
  plan: TrainerPlanId;
  planName: string;
  priceLabel: string;
  maxClients: number | null;
  clientCount: number;
  clientsRemaining: number | null;
  features: Record<TrainerPlanFeatureKey, boolean>;
};

export async function apiGetTrainerPlan(): Promise<TrainerPlanContextDto> {
  const res = await fetch("/api/me/trainer/plan", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { data: TrainerPlanContextDto };
  return body.data;
}

export async function apiPatchTrainerPlan(
  plan: TrainerPlanId,
): Promise<TrainerPlanContextDto> {
  const res = await fetch("/api/me/trainer/plan", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { data: TrainerPlanContextDto };
  return body.data;
}

export async function apiGetTrainerProfile(): Promise<TrainerProfileDto> {
  const res = await fetch("/api/me/trainer/profile", {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to load trainer profile");
  }
  const body = (await res.json()) as { data: TrainerProfileDto };
  return body.data;
}

export async function apiPatchTrainerProfile(
  input: Partial<{
    fullName: string;
    specialty: string;
    bio: string;
    yearsExperience: number;
  }>,
): Promise<TrainerProfileDto> {
  const res = await fetch("/api/me/trainer/profile", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error("Failed to save trainer profile");
  }
  const body = (await res.json()) as { data: TrainerProfileDto };
  return body.data;
}

export type TrainerServiceDto = {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
  priceLabel: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

async function readApiError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    return body.error?.message ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export async function apiListTrainerServices(): Promise<TrainerServiceDto[]> {
  const res = await fetch("/api/me/trainer/services", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { data: TrainerServiceDto[] };
  return body.data;
}

export async function apiCreateTrainerService(input: {
  title: string;
  description?: string;
  durationMinutes: number;
  priceCents: number;
}): Promise<TrainerServiceDto> {
  const res = await fetch("/api/me/trainer/services", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { data: TrainerServiceDto };
  return body.data;
}

export async function apiPatchTrainerService(
  id: string,
  input: Partial<{
    title: string;
    description: string;
    durationMinutes: number;
    priceCents: number;
    isActive: boolean;
  }>,
): Promise<TrainerServiceDto> {
  const res = await fetch(`/api/me/trainer/services/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { data: TrainerServiceDto };
  return body.data;
}

export type TrainerAvailabilitySlotDto = {
  id: string;
  serviceId: string | null;
  startsAt: string;
  endsAt: string;
  isBooked: boolean;
  label: string;
};

export async function apiListServiceSlots(
  serviceId: string,
): Promise<TrainerAvailabilitySlotDto[]> {
  const res = await fetch(`/api/me/trainer/services/${serviceId}/slots`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { data: TrainerAvailabilitySlotDto[] };
  return body.data;
}

export async function apiCreateServiceSlot(
  serviceId: string,
  startsAt: string,
): Promise<TrainerAvailabilitySlotDto> {
  const res = await fetch(`/api/me/trainer/services/${serviceId}/slots`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ startsAt }),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { data: TrainerAvailabilitySlotDto };
  return body.data;
}

export async function apiDeleteServiceSlot(
  serviceId: string,
  slotId: string,
): Promise<void> {
  const res = await fetch(
    `/api/me/trainer/services/${serviceId}/slots/${slotId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  if (!res.ok) throw new Error(await readApiError(res));
}

export type TrainerClientDto = {
  id: string;
  name: string;
  email: string;
  goal: string;
  sessions: number;
  notes: string;
  lastSession: string;
  nextSession: string;
  progressPct: number;
  status: "active" | "paused" | "trial";
};

export type TrainerAnalyticsDto = {
  bookingsCount: number;
  revenue30dCents: number;
  revenue30dLabel: string;
  activeClients: number;
  retentionPct: number;
  aiRemindersGenerated: number;
  revenueTrend: number[];
  bookingsByWeekday: number[];
  bookingsTrend: number[];
  clientLoad: { active: number; paused: number; trial: number };
  recentActivity: { id: string; label: string; time: string }[];
};

export async function apiListTrainerClients(): Promise<TrainerClientDto[]> {
  const res = await fetch("/api/me/trainer/clients", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { data: TrainerClientDto[] };
  return body.data;
}

export type TrainerClientDetailDto = {
  client: TrainerClientDto;
  bookings: BookingDto[];
  attendance: { showRatePct: number; completed: number; total: number };
  workoutCount: number;
};

export async function apiGetTrainerClient(
  clientUserId: string,
): Promise<TrainerClientDetailDto> {
  const res = await fetch(`/api/me/trainer/clients/${clientUserId}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { data: TrainerClientDetailDto };
  return body.data;
}

export async function apiPatchTrainerClientNotes(
  clientUserId: string,
  notes: string,
): Promise<TrainerClientDetailDto> {
  const res = await fetch(`/api/me/trainer/clients/${clientUserId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { data: TrainerClientDetailDto };
  return body.data;
}

export type TrainerNotificationPrefsDto = {
  emailNewBooking: boolean;
  emailBookingConfirmed: boolean;
  emailBookingCancelled: boolean;
  emailDailyDigest: boolean;
};

export async function apiGetTrainerSettings(): Promise<{
  notifications: TrainerNotificationPrefsDto;
}> {
  const res = await fetch("/api/me/trainer/settings", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as {
    data: { notifications: TrainerNotificationPrefsDto };
  };
  return body.data;
}

export async function apiPatchTrainerSettings(input: {
  notifications: Partial<TrainerNotificationPrefsDto>;
}): Promise<{ notifications: TrainerNotificationPrefsDto }> {
  const res = await fetch("/api/me/trainer/settings", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input.notifications),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as {
    data: { notifications: TrainerNotificationPrefsDto };
  };
  return body.data;
}

export type CalendarOpenSlotDto = {
  id: string;
  startsAt: string;
  endsAt: string;
  serviceId: string | null;
  label: string;
};

export async function apiListTrainerCalendarSlots(
  from: Date,
  to: Date,
): Promise<CalendarOpenSlotDto[]> {
  const params = new URLSearchParams({
    from: from.toISOString(),
    to: to.toISOString(),
  });
  const res = await fetch(`/api/me/trainer/calendar-slots?${params}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { data: CalendarOpenSlotDto[] };
  return body.data;
}

export type WeeklyDayDto = {
  dayOfWeek: number;
  dayLabel: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
};

export async function apiGetWeeklyAvailability(): Promise<{ days: WeeklyDayDto[] }> {
  const res = await fetch("/api/me/trainer/availability/weekly", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { data: { days: WeeklyDayDto[] } };
  return body.data;
}

export async function apiPatchWeeklyAvailability(input: {
  days: {
    dayOfWeek: number;
    enabled: boolean;
    startTime: string;
    endTime: string;
  }[];
}): Promise<{ days: WeeklyDayDto[] }> {
  const res = await fetch("/api/me/trainer/availability/weekly", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { data: { days: WeeklyDayDto[] } };
  return body.data;
}

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

export type TrainerNotificationDto = {
  id: string;
  title: string;
  body: string;
  tone: "info" | "success" | "warning" | "neutral";
  timeLabel: string;
  createdAt: string;
  href: string;
};

export async function apiListTrainerNotifications(): Promise<{
  items: TrainerNotificationDto[];
  readIds: string[];
}> {
  const res = await fetch("/api/me/trainer/notifications", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as {
    data: { items: TrainerNotificationDto[]; readIds: string[] };
  };
  return body.data;
}

export async function apiMarkTrainerNotificationsRead(input: {
  notificationId?: string;
  markAll?: boolean;
}): Promise<{ readIds: string[] }> {
  const res = await fetch("/api/me/trainer/notifications/read", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { data: { readIds: string[] } };
  return body.data;
}

export async function apiTrainerSearch(
  q: string,
  limit = 12,
): Promise<TrainerSearchResponseDto> {
  const params = new URLSearchParams({ q, limit: String(limit) });
  const res = await fetch(`/api/me/trainer/search?${params}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { data: TrainerSearchResponseDto };
  return body.data;
}

export async function apiGetTrainerAnalytics(): Promise<TrainerAnalyticsDto> {
  const res = await fetch("/api/me/trainer/analytics", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { data: TrainerAnalyticsDto };
  return body.data;
}
