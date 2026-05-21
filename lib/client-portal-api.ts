import type { ApiValidationIssue } from "@/lib/auth-api";
import { apiFetch } from "@/lib/api-fetch";
import type { ClientGoalsState, GoalKey } from "@/lib/client-goals-storage";
import type { ClientNotification, WorkoutHistoryRow } from "@/lib/client-mocks";
import type { ClientProfileExtension } from "@/lib/client-profile-extension";

export type ClientProfileDto = {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  headline: string;
  phone: string;
  city: string;
  timezone: string;
  bio: string;
  selectedTrainerProfileId: string | null;
};

export type ClientCoachDto = {
  id: string;
  fullName: string | null;
  specialty: string | null;
  bio: string | null;
  email: string;
  stats: { averageRating: number | null; reviewCount: number };
  activeServicesCount: number;
};

export type ClientGoalsDto = {
  active: GoalKey;
  activeLabel: string;
  pct: Record<GoalKey, number>;
  notes: Partial<Record<GoalKey, string>>;
  updatedAt: string;
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

export function goalsDtoToState(dto: ClientGoalsDto): ClientGoalsState {
  return { active: dto.active, pct: dto.pct, notes: dto.notes ?? {} };
}

export function profileDtoToExtension(dto: ClientProfileDto): ClientProfileExtension {
  return {
    headline: dto.headline,
    phone: dto.phone,
    city: dto.city,
    timezone: dto.timezone,
    bio: dto.bio,
  };
}

export async function apiGetClientProfile(): Promise<ClientProfileDto> {
  const res = await apiFetch("/api/me/profile", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { data: ClientProfileDto };
  return body.data;
}

export async function apiPatchClientProfile(
  input: Partial<{
    fullName: string;
    headline: string;
    phone: string;
    city: string;
    timezone: string;
    bio: string;
    selectedTrainerProfileId: string | null;
  }>,
): Promise<
  | { ok: true; profile: ClientProfileDto }
  | { ok: false; message: string; issues?: ApiValidationIssue[] }
> {
  const res = await apiFetch("/api/me/profile", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    try {
      const body = (await res.json()) as ApiErrorBody;
      return {
        ok: false,
        message: body.error?.message ?? "Could not update profile",
        issues: body.error?.details?.issues,
      };
    } catch {
      return { ok: false, message: "Could not update profile" };
    }
  }

  const body = (await res.json()) as { data: ClientProfileDto };
  return { ok: true, profile: body.data };
}

export async function apiGetClientCoach(): Promise<ClientCoachDto | null> {
  const res = await apiFetch("/api/me/coach", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { data: ClientCoachDto | null };
  return body.data;
}

export async function apiGetClientGoals(): Promise<ClientGoalsDto> {
  const res = await apiFetch("/api/me/goals", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { data: ClientGoalsDto };
  return body.data;
}

export async function apiPatchClientGoals(
  input: Partial<{
    active: GoalKey;
    pct: Partial<Record<GoalKey, number>>;
    notes: Partial<Record<GoalKey, string>>;
  }>,
): Promise<ClientGoalsDto> {
  const res = await apiFetch("/api/me/goals", {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as { data: ClientGoalsDto };
  return body.data;
}

export async function apiGetClientWorkouts(query?: {
  type?: string;
}): Promise<WorkoutHistoryRow[]> {
  const params = new URLSearchParams();
  if (query?.type && query.type !== "all") params.set("type", query.type);

  const res = await apiFetch(`/api/me/workouts?${params}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as {
    data: {
      id: string;
      date: string;
      type: string;
      durationMin: number;
      calories: number;
      trainerNote: string;
    }[];
  };

  return body.data.map((w) => ({
    id: w.id,
    date: w.date,
    type: w.type,
    durationMin: w.durationMin,
    calories: w.calories,
    trainerNote: w.trainerNote,
  }));
}

export async function apiGetClientNotifications(): Promise<ClientNotification[]> {
  const res = await apiFetch("/api/me/notifications", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await readApiError(res));
  const body = (await res.json()) as {
    data: {
      id: string;
      title: string;
      body: string;
      tone: ClientNotification["tone"];
      timeLabel: string;
      read: boolean;
    }[];
  };

  return body.data.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    timeLabel: n.timeLabel,
    tone: n.tone,
    read: n.read,
  }));
}

export async function apiMarkNotificationRead(
  notificationId: string,
): Promise<void> {
  const res = await apiFetch(`/api/me/notifications/${notificationId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ read: true }),
  });
  if (!res.ok) throw new Error(await readApiError(res));
}
