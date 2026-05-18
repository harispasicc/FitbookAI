export type ApiAuthUser = {
  id: string;
  email: string;
  name: string;
  role: "client" | "trainer";
  trainerProfileId: string | null;
  clientProfileId: string | null;
};

type ApiErrorBody = {
  error?: {
    message?: string;
    code?: string;
    details?: {
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
  | { ok: false; code: string; message: string }
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

export async function apiMe(): Promise<ApiAuthUser | null> {
  const res = await fetch("/api/me", {
    credentials: "include",
    cache: "no-store",
  });
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    return null;
  }
  const body = (await res.json()) as { data: ApiAuthUser };
  return body.data;
}
