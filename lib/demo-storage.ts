import type { DemoState } from "@/lib/demo-types";
import type { BookingRow } from "@/lib/mock-bookings";
import { notifyDemoDataUpdated } from "@/lib/demo-data-events";
import { buildDemoState } from "@/lib/demo-seed";
export const PORTFOLIO_STORAGE_KEY = "fitbook-portfolio-v1";
export const LEGACY_PORTFOLIO_STORAGE_KEY = "fb-demo-v1";
function migrateDemoState(raw: DemoState): DemoState {
    return {
        ...raw,
        clients: raw.clients.map((c) => {
            const x = c as Record<string, unknown>;
            return {
                id: c.id,
                name: c.name,
                goal: c.goal,
                sessions: c.sessions,
                notes: c.notes,
                lastSession: c.lastSession,
                progressPct: typeof x.progressPct === "number" ? x.progressPct : 50,
                nextSession: typeof x.nextSession === "string" ? x.nextSession : "—",
                status: x.status === "paused" || x.status === "trial" ? x.status : "active",
                weightKg: typeof x.weightKg === "number" ? x.weightKg : undefined,
            };
        }),
        services: raw.services.map((s) => {
            const x = s as Record<string, unknown>;
            return {
                id: s.id,
                name: s.name,
                durationMin: s.durationMin,
                priceUsd: s.priceUsd,
                mode: s.mode,
                maxParticipants: typeof x.maxParticipants === "number" ? x.maxParticipants : 1,
                active: typeof x.active === "boolean" ? x.active : true,
                description: typeof x.description === "string" ? x.description : "",
            };
        }),
        bookings: raw.bookings.map((b) => ({
            ...b,
            slotIso: b.slotIso,
            trainerId: b.trainerId,
            clientEmail: b.clientEmail,
        })),
        analytics: {
            ...raw.analytics,
            aiRemindersGenerated: (() => {
                const x = raw.analytics as Record<string, unknown>;
                if (typeof x.aiRemindersGenerated === "number")
                    return x.aiRemindersGenerated;
                if (typeof x.reminderDrafts === "number")
                    return x.reminderDrafts;
                return 120;
            })(),
        },
    };
}
export function readDemoState(): DemoState | null {
    if (typeof window === "undefined")
        return null;
    try {
        let raw = window.localStorage.getItem(PORTFOLIO_STORAGE_KEY);
        if (!raw) {
            raw = window.localStorage.getItem(LEGACY_PORTFOLIO_STORAGE_KEY);
            if (raw) {
                window.localStorage.setItem(PORTFOLIO_STORAGE_KEY, raw);
                window.localStorage.removeItem(LEGACY_PORTFOLIO_STORAGE_KEY);
            }
        }
        if (!raw)
            return null;
        const parsed = JSON.parse(raw) as DemoState;
        if (parsed?.version !== 1 || !Array.isArray(parsed.bookings))
            return null;
        return migrateDemoState(parsed);
    }
    catch {
        return null;
    }
}
export function writeDemoState(state: DemoState) {
    if (typeof window === "undefined")
        return;
    window.localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(state));
    notifyDemoDataUpdated();
}
export function appendDemoBooking(row: BookingRow) {
    const current = readDemoState();
    const base = current ?? buildDemoState();
    writeDemoState({ ...base, bookings: [row, ...base.bookings] });
}
export function clearDemoState() {
    if (typeof window === "undefined")
        return;
    window.localStorage.removeItem(PORTFOLIO_STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_PORTFOLIO_STORAGE_KEY);
}
export function seedDemoState() {
    const state = buildDemoState();
    writeDemoState(state);
    return state;
}
