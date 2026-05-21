import type { ApiValidationIssue } from "@/lib/auth-api";
import { apiFetch } from "@/lib/api-fetch";

export type AppBookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

export type BookingDto = {
  id: string;
  status: AppBookingStatus;
  startsAt: string;
  endsAt: string;
  priceCents: number;
  priceLabel: string;
  notes: string | null;
  availabilitySlotId: string | null;
  trainer: {
    id: string;
    fullName: string | null;
    specialty: string | null;
  };
  service: {
    id: string;
    title: string;
    durationMinutes: number;
  };
  client: {
    id: string;
    email: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  hasReview: boolean;
};

export type CoachReviewDto = {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

type ApiErrorBody = {
  error?: {
    message?: string;
    code?: string;
    details?: { issues?: ApiValidationIssue[] };
  };
};

async function readApiError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as ApiErrorBody;
    return body.error?.message ?? "Request failed";
  } catch {
    return "Request failed";
  }
}

export type CoachServiceDto = {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  priceCents: number;
  priceLabel: string;
  isActive: boolean;
  sortOrder: number;
};

export type CoachAvailabilitySlotDto = {
  id: string;
  serviceId: string | null;
  startsAt: string;
  endsAt: string;
  isBooked: boolean;
  label: string;
};

export type CoachAvailabilityDto = {
  weekly: {
    dayOfWeek: number;
    dayLabel: string;
    windows: { startTime: string; endTime: string }[];
  }[];
  upcomingSlots: CoachAvailabilitySlotDto[];
};

export async function apiFetchCoachServices(
  trainerProfileId: string,
): Promise<CoachServiceDto[]> {
  const res = await fetch(`/api/coaches/${trainerProfileId}/services`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await readApiError(res));
  }
  const body = (await res.json()) as { data: CoachServiceDto[] };
  return body.data.filter((s) => s.isActive);
}

export async function apiFetchCoachAvailability(
  trainerProfileId: string,
  options?: { serviceId?: string; limit?: number },
): Promise<CoachAvailabilityDto> {
  const params = new URLSearchParams();
  params.set("limit", String(options?.limit ?? 30));
  if (options?.serviceId) {
    params.set("serviceId", options.serviceId);
  }

  const res = await fetch(
    `/api/coaches/${trainerProfileId}/availability?${params}`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error(await readApiError(res));
  }
  const body = (await res.json()) as { data: CoachAvailabilityDto };
  return body.data;
}

export async function apiCreateBooking(input: {
  trainerProfileId: string;
  serviceId: string;
  availabilitySlotId: string;
  notes?: string;
}): Promise<
  | { ok: true; booking: BookingDto }
  | { ok: false; message: string; issues?: ApiValidationIssue[] }
> {
  const res = await apiFetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    try {
      const body = (await res.json()) as ApiErrorBody;
      return {
        ok: false,
        message: body.error?.message ?? "Could not create booking",
        issues: body.error?.details?.issues,
      };
    } catch {
      return { ok: false, message: "Could not create booking" };
    }
  }

  const body = (await res.json()) as { data: BookingDto };
  return { ok: true, booking: body.data };
}

export async function apiListMyBookings(query?: {
  status?: AppBookingStatus;
  limit?: number;
}): Promise<BookingDto[]> {
  const params = new URLSearchParams();
  if (query?.status) params.set("status", query.status);
  if (query?.limit) params.set("limit", String(query.limit));

  const res = await apiFetch(`/api/me/bookings?${params}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await readApiError(res));
  }
  const body = (await res.json()) as { data: BookingDto[] };
  return body.data;
}

export async function apiListTrainerBookings(query?: {
  status?: AppBookingStatus;
  limit?: number;
}): Promise<BookingDto[]> {
  const params = new URLSearchParams();
  if (query?.status) params.set("status", query.status);
  if (query?.limit) params.set("limit", String(query.limit));

  const res = await apiFetch(`/api/trainer/bookings?${params}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await readApiError(res));
  }
  const body = (await res.json()) as { data: BookingDto[] };
  return body.data;
}

export async function apiUpdateBookingStatus(
  bookingId: string,
  status: AppBookingStatus,
): Promise<
  | { ok: true; booking: BookingDto }
  | { ok: false; message: string }
> {
  const res = await apiFetch(`/api/bookings/${bookingId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    return { ok: false, message: await readApiError(res) };
  }

  const body = (await res.json()) as { data: BookingDto };
  return { ok: true, booking: body.data };
}

export async function apiRescheduleBooking(
  bookingId: string,
  availabilitySlotId: string,
): Promise<
  | { ok: true; booking: BookingDto }
  | { ok: false; message: string }
> {
  const res = await apiFetch(`/api/bookings/${bookingId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ availabilitySlotId }),
  });

  if (!res.ok) {
    return { ok: false, message: await readApiError(res) };
  }

  const body = (await res.json()) as { data: BookingDto };
  return { ok: true, booking: body.data };
}

export async function apiCancelBooking(
  bookingId: string,
): Promise<
  | { ok: true; booking: BookingDto }
  | { ok: false; message: string }
> {
  const res = await apiFetch(`/api/bookings/${bookingId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    return { ok: false, message: await readApiError(res) };
  }

  const body = (await res.json()) as { data: BookingDto };
  return { ok: true, booking: body.data };
}

export async function apiSubmitBookingReview(
  bookingId: string,
  input: { rating: number; comment?: string },
): Promise<
  | { ok: true; review: CoachReviewDto }
  | { ok: false; message: string }
> {
  const res = await apiFetch(`/api/me/bookings/${bookingId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    return { ok: false, message: await readApiError(res) };
  }

  const body = (await res.json()) as { data: CoachReviewDto };
  return { ok: true, review: body.data };
}
