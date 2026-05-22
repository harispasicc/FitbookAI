import {
  type APIRequestContext,
  expect,
  request as playwrightRequest,
} from "@playwright/test";
import {
  DEMO_CLIENT,
  DEMO_COACH_PROFILE_NAME,
  DEMO_TRAINER,
} from "../../lib/demo-accounts";
import type {
  ApiEnvelope,
  ApiFailure,
  AuthUserDto,
  AvailabilitySlot,
  BookingDto,
  ClientNotification,
  CoachListItem,
} from "./types";

export { DEMO_CLIENT, DEMO_TRAINER, DEMO_COACH_PROFILE_NAME };

export async function loginApi(
  request: APIRequestContext,
  creds: { email: string; password: string; role: "client" | "trainer" },
): Promise<AuthUserDto> {
  const res = await request.post("/api/auth/login", {
    data: {
      email: creds.email,
      password: creds.password,
      expectedRole: creds.role,
    },
  });
  expect(res.ok(), `login failed for ${creds.email}: ${await res.text()}`).toBeTruthy();
  const body = (await res.json()) as ApiEnvelope<AuthUserDto>;
  expect(body.data.role).toBe(creds.role);
  return body.data;
}

export async function findDemoCoachId(
  request: APIRequestContext,
): Promise<string> {
  const res = await request.get("/api/coaches");
  expect(res.ok()).toBeTruthy();
  const body = (await res.json()) as ApiEnvelope<CoachListItem[]>;
  const amina = body.data.find((c) =>
    (c.fullName ?? "").startsWith("Amina"),
  );
  const fallback = body.data[0];
  const coach = amina ?? fallback;
  expect(coach?.id, "seed coach missing — run npm run db:seed").toBeTruthy();
  return coach!.id;
}

export async function findBookableSlot(
  request: APIRequestContext,
  coachId: string,
  excludeSlotIds: string[] = [],
): Promise<{ slotId: string; serviceId: string }> {
  const res = await request.get(`/api/coaches/${coachId}/availability`);
  expect(res.ok()).toBeTruthy();
  const body = (await res.json()) as ApiEnvelope<{
    upcomingSlots?: AvailabilitySlot[];
    slots?: AvailabilitySlot[];
  }>;
  const slots = body.data.upcomingSlots ?? body.data.slots ?? [];
  const slot = slots.find(
    (s) => !s.isBooked && !excludeSlotIds.includes(s.id) && s.serviceId,
  );
  expect(slot, "no free availability slot — run npm run db:reset").toBeTruthy();
  return { slotId: slot!.id, serviceId: slot!.serviceId! };
}

export async function getPrimaryServiceId(
  request: APIRequestContext,
  coachId: string,
): Promise<string> {
  const res = await request.get(`/api/coaches/${coachId}/services`);
  expect(res.ok()).toBeTruthy();
  const body = (await res.json()) as ApiEnvelope<{ id: string }[]>;
  expect(body.data.length).toBeGreaterThan(0);
  return body.data[0]!.id;
}

export async function createBooking(
  request: APIRequestContext,
  input: {
    trainerProfileId: string;
    serviceId: string;
    availabilitySlotId: string;
    notes?: string;
  },
): Promise<BookingDto> {
  const res = await request.post("/api/bookings", { data: input });
  expect(res.ok(), await res.text()).toBeTruthy();
  const body = (await res.json()) as ApiEnvelope<BookingDto>;
  return body.data;
}

export async function expectBookingPostConflict(
  request: APIRequestContext,
  input: {
    trainerProfileId: string;
    serviceId: string;
    availabilitySlotId: string;
  },
): Promise<void> {
  const res = await request.post("/api/bookings", { data: input });
  expect(res.status()).toBe(409);
  const body = (await res.json()) as ApiFailure;
  expect(body.error.code).toBeTruthy();
}

export async function patchBooking(
  request: APIRequestContext,
  bookingId: string,
  data: Record<string, unknown>,
): Promise<BookingDto> {
  const res = await request.patch(`/api/bookings/${bookingId}`, { data });
  expect(res.ok(), await res.text()).toBeTruthy();
  const body = (await res.json()) as ApiEnvelope<BookingDto>;
  return body.data;
}

export async function cancelBooking(
  request: APIRequestContext,
  bookingId: string,
): Promise<BookingDto> {
  const res = await request.delete(`/api/bookings/${bookingId}`);
  expect(res.ok(), await res.text()).toBeTruthy();
  const body = (await res.json()) as ApiEnvelope<BookingDto>;
  return body.data;
}

export async function submitReview(
  request: APIRequestContext,
  bookingId: string,
  rating: number,
  comment?: string,
): Promise<void> {
  const res = await request.post(`/api/me/bookings/${bookingId}/review`, {
    data: { rating, comment },
  });
  expect(res.ok(), await res.text()).toBeTruthy();
}

export async function expectReviewConflict(
  request: APIRequestContext,
  bookingId: string,
): Promise<void> {
  const res = await request.post(`/api/me/bookings/${bookingId}/review`, {
    data: { rating: 4 },
  });
  expect(res.status()).toBe(409);
}

export async function listClientBookings(
  request: APIRequestContext,
): Promise<BookingDto[]> {
  const res = await request.get("/api/me/bookings?limit=50");
  expect(res.ok()).toBeTruthy();
  const body = (await res.json()) as ApiEnvelope<BookingDto[]>;
  return body.data;
}

export async function waitForBookingStatus(
  request: APIRequestContext,
  bookingId: string,
  status: BookingDto["status"],
  timeoutMs = 15_000,
): Promise<BookingDto> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const bookings = await listClientBookings(request);
    const match = bookings.find((b) => b.id === bookingId);
    if (match?.status === status) return match;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`booking ${bookingId} did not reach status "${status}" within ${timeoutMs}ms`);
}

export async function listNotifications(
  request: APIRequestContext,
): Promise<ClientNotification[]> {
  const res = await request.get("/api/me/notifications");
  expect(res.ok()).toBeTruthy();
  const body = (await res.json()) as ApiEnvelope<ClientNotification[]>;
  return body.data;
}

export async function markNotificationRead(
  request: APIRequestContext,
  id: string,
): Promise<void> {
  const res = await request.patch(`/api/me/notifications/${id}`, {
    data: { read: true },
  });
  expect(res.ok()).toBeTruthy();
}

export async function createApiContext(baseURL: string) {
  return playwrightRequest.newContext({ baseURL });
}

export async function storageStateFromLogin(
  baseURL: string,
  creds: { email: string; password: string; role: "client" | "trainer" },
) {
  const ctx = await createApiContext(baseURL);
  await loginApi(ctx, creds);
  const state = await ctx.storageState();
  await ctx.dispose();
  return state;
}
