"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode, } from "react";
import { clearDemoState, seedDemoState } from "@/lib/demo-storage";
const STORAGE_KEY = "saas-dashboard-session";
export type AuthUser = {
    email: string;
    name: string;
    role: "client" | "trainer";
    selectedTrainerId?: string;
};
type StoredSession = {
    user: AuthUser;
};
export type AuthSignupOptions = {
    role?: "client" | "trainer";
    selectedTrainerId?: string;
};
export type AuthLoginOptions = {
    selectedTrainerId?: string;
    expectedRole?: "client" | "trainer";
};
export type AuthLoginResult = {
    ok: true;
    user: AuthUser;
} | {
    ok: false;
    reason: "role_mismatch";
    existingRole: "client" | "trainer";
};
type AuthContextValue = {
    user: AuthUser | null;
    isHydrated: boolean;
    login: (email: string, _password: string, options?: AuthLoginOptions) => AuthLoginResult;
    signup: (name: string, email: string, _password: string, options?: AuthSignupOptions) => AuthUser;
    updateProfile: (updates: {
        name?: string;
    }) => void;
    selectTrainerForClient: (trainerId: string) => void;
    logout: () => void;
};
const AuthContext = createContext<AuthContextValue | null>(null);
function readSession(): AuthUser | null {
    if (typeof window === "undefined")
        return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return null;
        const parsed = JSON.parse(raw) as StoredSession;
        if (!parsed?.user?.email)
            return null;
        const role = parsed.user.role === "trainer" ? "trainer" : "client";
        const selectedTrainerId = typeof parsed.user.selectedTrainerId === "string" ? parsed.user.selectedTrainerId : undefined;
        return {
            email: parsed.user.email,
            name: parsed.user.name || parsed.user.email.split("@")[0] || "User",
            role,
            ...(selectedTrainerId ? { selectedTrainerId } : {}),
        };
    }
    catch {
        return null;
    }
}
function writeSession(user: AuthUser | null) {
    if (typeof window === "undefined")
        return;
    if (!user) {
        window.localStorage.removeItem(STORAGE_KEY);
        return;
    }
    const payload: StoredSession = { user };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}
export function AuthProvider({ children }: {
    children: ReactNode;
}) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);
    useEffect(() => {
        const session = readSession();
        queueMicrotask(() => {
            setUser(session);
            setIsHydrated(true);
        });
    }, []);
    const login = useCallback((email: string, password: string, options?: AuthLoginOptions): AuthLoginResult => {
        void password;
        const normalized = email.trim().toLowerCase();
        const tid = options?.selectedTrainerId?.trim();
        const expected: "client" | "trainer" = options?.expectedRole === "trainer" ? "trainer" : "client";
        const prev = readSession();
        if (prev && prev.email === normalized && prev.role !== expected) {
            return { ok: false, reason: "role_mismatch", existingRole: prev.role };
        }
        let next: AuthUser;
        if (prev && prev.email === normalized) {
            next = { ...prev };
        }
        else {
            next = {
                email: normalized,
                name: normalized.split("@")[0] || "User",
                role: expected,
            };
        }
        if (tid && next.role === "client") {
            next = { ...next, selectedTrainerId: tid };
        }
        if (next.role === "trainer") {
            next = { email: next.email, name: next.name, role: "trainer" };
        }
        writeSession(next);
        setUser(next);
        return { ok: true, user: next };
    }, []);
    const signup = useCallback((name: string, email: string, password: string, options?: AuthSignupOptions) => {
        void password;
        const role = options?.role === "trainer" ? "trainer" : "client";
        const selectedTrainerId = role === "client" && options?.selectedTrainerId ? options.selectedTrainerId.trim() : undefined;
        const next: AuthUser = {
            email: email.trim().toLowerCase(),
            name: name.trim() || email.split("@")[0] || "User",
            role,
            ...(selectedTrainerId ? { selectedTrainerId } : {}),
        };
        writeSession(next);
        seedDemoState();
        setUser(next);
        return next;
    }, []);
    const logout = useCallback(() => {
        clearDemoState();
        writeSession(null);
        setUser(null);
    }, []);
    const updateProfile = useCallback((updates: {
        name?: string;
    }) => {
        const current = readSession();
        if (!current)
            return;
        const next: AuthUser = {
            ...current,
            ...(updates.name !== undefined
                ? { name: updates.name.trim() || current.email.split("@")[0] || "User" }
                : {}),
        };
        writeSession(next);
        setUser(next);
    }, []);
    const selectTrainerForClient = useCallback((trainerId: string) => {
        const current = readSession();
        if (!current || current.role !== "client")
            return;
        const tid = trainerId.trim();
        if (!tid)
            return;
        const next: AuthUser = { ...current, selectedTrainerId: tid };
        writeSession(next);
        setUser(next);
    }, []);
    const value = useMemo(() => ({ user, isHydrated, login, signup, updateProfile, selectTrainerForClient, logout }), [user, isHydrated, login, signup, updateProfile, selectTrainerForClient, logout]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}
