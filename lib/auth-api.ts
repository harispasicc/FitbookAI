import { apiFetch } from "@/lib/api-fetch";

export type ApiAuthUser = {
  id: string;
  email: string;
  name: string;
  role: "client" | "trainer";
  trainerProfileId: string | null;
  clientProfileId: string | null;
};

export type ApiValidationIssue = {
  field: string;
  message: string;
};

type ApiErrorBody = {
  error?: {
    message?: string;
    code?: string;
    details?: {
      issues?: ApiValidationIssue[];
      existingRole?: "client" | "trainer";
    };
  };
};

async function readApiError(res: Response): Promise<ApiErrorBody["error"]> {
  try {
    const body = (await res.json()) as ApiErrorBody;
    return body.error;
  } catch {
    return { message: "Request failed" };
  }
}

export async function apiRegister(input: {
  name: string;
  email: string;
  password: string;
  role: "client" | "trainer";
}): Promise<
  | { ok: true; user: ApiAuthUser }
  | { ok: false; code: string; message: string; issues?: ApiValidationIssue[] }
> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = await readApiError(res);
    return {
      ok: false,
      code: err?.code ?? "UNKNOWN",
      message: err?.message ?? "Registration failed",
      issues: err?.details?.issues,
    };
  }

  const body = (await res.json()) as { data: ApiAuthUser };
  return { ok: true, user: body.data };
}

export async function apiLogin(input: {
  email: string;
  password: string;
  expectedRole?: "client" | "trainer";
}): Promise<
  | { ok: true; user: ApiAuthUser }
  | {
      ok: false;
      reason: "role_mismatch" | "invalid_credentials";
      message: string;
      existingRole?: "client" | "trainer";
    }
> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = await readApiError(res);
    if (err?.code === "ROLE_MISMATCH") {
      return {
        ok: false,
        reason: "role_mismatch",
        message: err.message ?? "Wrong portal for this account",
        existingRole: err.details?.existingRole,
      };
    }
    return {
      ok: false,
      reason: "invalid_credentials",
      message: err?.message ?? "Invalid email or password",
    };
  }

  const body = (await res.json()) as { data: ApiAuthUser };
  return { ok: true, user: body.data };
}

export async function apiLogout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

export async function apiForgotPassword(input: {
  email: string;
}): Promise<
  | { ok: true; message: string; devResetUrl?: string }
  | { ok: false; message: string; issues?: ApiValidationIssue[] }
> {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    try {
      const body = (await res.json()) as ApiErrorBody;
      return {
        ok: false,
        message: body.error?.message ?? "Could not send reset email",
        issues: body.error?.details?.issues,
      };
    } catch {
      return { ok: false, message: "Could not send reset email" };
    }
  }

  const body = (await res.json()) as {
    data: { message: string };
    meta?: { devResetUrl?: string };
  };
  return {
    ok: true,
    message: body.data.message,
    devResetUrl: body.meta?.devResetUrl,
  };
}

export async function apiResetPassword(input: {
  token: string;
  password: string;
}): Promise<
  | { ok: true; message: string }
  | { ok: false; code: string; message: string; issues?: ApiValidationIssue[] }
> {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    try {
      const body = (await res.json()) as ApiErrorBody;
      return {
        ok: false,
        code: body.error?.code ?? "UNKNOWN",
        message: body.error?.message ?? "Could not reset password",
        issues: body.error?.details?.issues,
      };
    } catch {
      return { ok: false, code: "UNKNOWN", message: "Could not reset password" };
    }
  }

  const body = (await res.json()) as { data: { message: string } };
  return { ok: true, message: body.data.message };
}

export async function apiMe(): Promise<ApiAuthUser | null> {
  const res = await apiFetch("/api/me", {
    cache: "no-store",
  });
  if (!res.ok) {
    return null;
  }
  const body = (await res.json()) as { data: ApiAuthUser | null };
  return body.data;
}
