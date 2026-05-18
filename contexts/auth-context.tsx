"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  apiLogin,
  apiLogout,
  apiMe,
  apiRegister,
  type ApiAuthUser,
} from "@/lib/auth-api";
import { clearDemoState, seedDemoState } from "@/lib/demo-storage";

const CLIENT_TRAINER_PREF_KEY = "saas-dashboard-client-trainer";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "client" | "trainer";
  trainerProfileId?: string;
  clientProfileId?: string;
  selectedTrainerId?: string;
};

export type AuthSignupOptions = {
  role?: "client" | "trainer";
  selectedTrainerId?: string;
};

export type AuthLoginOptions = {
  selectedTrainerId?: string;
  expectedRole?: "client" | "trainer";
};

export type AuthLoginResult =
  | { ok: true; user: AuthUser }
  | {
      ok: false;
      reason: "role_mismatch" | "invalid_credentials";
      existingRole?: "client" | "trainer";
      message?: string;
    };

export type AuthSignupResult =
  | { ok: true; user: AuthUser }
  | { ok: false; message: string; code?: string };

type AuthContextValue = {
  user: AuthUser | null;
  isHydrated: boolean;
  login: (
    email: string,
    password: string,
    options?: AuthLoginOptions,
  ) => Promise<AuthLoginResult>;
  signup: (
    name: string,
    email: string,
    password: string,
    options?: AuthSignupOptions,
  ) => Promise<AuthSignupResult>;
  updateProfile: (updates: { name?: string }) => void;
  selectTrainerForClient: (trainerId: string) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readClientTrainerPref(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(CLIENT_TRAINER_PREF_KEY);
    return raw?.trim() || undefined;
  } catch {
    return undefined;
  }
}

function writeClientTrainerPref(trainerId: string | undefined) {
  if (typeof window === "undefined") return;
  if (!trainerId) {
    window.localStorage.removeItem(CLIENT_TRAINER_PREF_KEY);
    return;
  }
  window.localStorage.setItem(CLIENT_TRAINER_PREF_KEY, trainerId);
}

function mapApiUser(
  apiUser: ApiAuthUser,
  selectedTrainerId?: string,
): AuthUser {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    role: apiUser.role,
    ...(apiUser.trainerProfileId
      ? { trainerProfileId: apiUser.trainerProfileId }
      : {}),
    ...(apiUser.clientProfileId
      ? { clientProfileId: apiUser.clientProfileId }
      : {}),
    ...(apiUser.role === "client" && selectedTrainerId
      ? { selectedTrainerId }
      : {}),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const apiUser = await apiMe();
        if (cancelled) return;

        if (!apiUser) {
          setUser(null);
          return;
        }

        const pref =
          apiUser.role === "client" ? readClientTrainerPref() : undefined;
        setUser(mapApiUser(apiUser, pref));
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsHydrated(true);
        }
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
      options?: AuthLoginOptions,
    ): Promise<AuthLoginResult> => {
      const tid = options?.selectedTrainerId?.trim();
      const result = await apiLogin({
        email,
        password,
        expectedRole: options?.expectedRole,
      });

      if (!result.ok) {
        if (result.reason === "role_mismatch") {
          return {
            ok: false,
            reason: "role_mismatch",
            existingRole:
              result.existingRole ??
              (options?.expectedRole === "trainer" ? "client" : "trainer"),
            message: result.message,
          };
        }
        return {
          ok: false,
          reason: "invalid_credentials",
          message: result.message,
        };
      }

      if (tid && result.user.role === "client") {
        writeClientTrainerPref(tid);
      }

      const next = mapApiUser(
        result.user,
        result.user.role === "client" ? (tid ?? readClientTrainerPref()) : undefined,
      );
      setUser(next);
      return { ok: true, user: next };
    },
    [],
  );

  const signup = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      options?: AuthSignupOptions,
    ): Promise<AuthSignupResult> => {
      const role = options?.role === "trainer" ? "trainer" : "client";
      const tid =
        role === "client" && options?.selectedTrainerId
          ? options.selectedTrainerId.trim()
          : undefined;

      const result = await apiRegister({
        name,
        email,
        password,
        role,
      });

      if (!result.ok) {
        return {
          ok: false,
          message: result.message,
          code: result.code,
        };
      }

      if (tid && result.user.role === "client") {
        writeClientTrainerPref(tid);
      }

      seedDemoState();
      const next = mapApiUser(result.user, tid);
      setUser(next);
      return { ok: true, user: next };
    },
    [],
  );

  const logout = useCallback(async () => {
    await apiLogout();
    clearDemoState();
    writeClientTrainerPref(undefined);
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates: { name?: string }) => {
    setUser((current) => {
      if (!current) return current;
      return {
        ...current,
        ...(updates.name !== undefined
          ? {
              name:
                updates.name.trim() ||
                current.email.split("@")[0] ||
                "User",
            }
          : {}),
      };
    });
  }, []);

  const selectTrainerForClient = useCallback((trainerId: string) => {
    const tid = trainerId.trim();
    if (!tid) return;
    writeClientTrainerPref(tid);
    setUser((current) => {
      if (!current || current.role !== "client") return current;
      return { ...current, selectedTrainerId: tid };
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isHydrated,
      login,
      signup,
      updateProfile,
      selectTrainerForClient,
      logout,
    }),
    [user, isHydrated, login, signup, updateProfile, selectTrainerForClient, logout],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
