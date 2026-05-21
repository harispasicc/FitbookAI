export type ApiEnvelope<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiFailure = {
  error: { message: string; code: string; details?: unknown };
};

export type AuthUserDto = {
  id: string;
  email: string;
  name: string;
  role: "client" | "trainer";
  trainerProfileId?: string;
  clientProfileId?: string;
};

export type BookingDto = {
  id: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  startsAt: string;
  endsAt: string;
  hasReview: boolean;
  trainer: { id: string; fullName: string | null };
  service: { id: string; title: string };
};

export type CoachListItem = {
  id: string;
  fullName: string | null;
  specialty: string | null;
};

export type AvailabilitySlot = {
  id: string;
  serviceId: string | null;
  startsAt: string;
  endsAt: string;
  isBooked: boolean;
};

export type ClientNotification = {
  id: string;
  title: string;
  read: boolean;
};
