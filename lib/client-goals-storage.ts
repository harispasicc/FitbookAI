export type GoalKey = "lose" | "muscle" | "conditioning" | "rehab";
export type ClientGoalsState = {
    active: GoalKey;
    pct: Record<GoalKey, number>;
    notes: Partial<Record<GoalKey, string>>;
};
export const CLIENT_GOALS_STORAGE_KEY = "fitbook-client-goals-v1";
export const defaultClientGoals: ClientGoalsState = {
    active: "conditioning",
    pct: { lose: 34, muscle: 52, conditioning: 68, rehab: 41 },
    notes: {},
};
export const goalLabels: Record<GoalKey, string> = {
    lose: "Lose weight",
    muscle: "Build muscle",
    conditioning: "Improve conditioning",
    rehab: "Rehab / mobility",
};
export function readClientGoals(): ClientGoalsState {
    if (typeof window === "undefined")
        return defaultClientGoals;
    try {
        const raw = window.localStorage.getItem(CLIENT_GOALS_STORAGE_KEY);
        if (!raw)
            return defaultClientGoals;
        const p = JSON.parse(raw) as ClientGoalsState;
        if (!p || typeof p.active !== "string" || !p.pct)
            return defaultClientGoals;
        return {
            ...defaultClientGoals,
            ...p,
            pct: { ...defaultClientGoals.pct, ...p.pct },
            notes: { ...defaultClientGoals.notes, ...p.notes },
        };
    }
    catch {
        return defaultClientGoals;
    }
}
export const CLIENT_GOALS_UPDATE_EVENT = "fitbook-client-goals-updated";
export function writeClientGoals(g: ClientGoalsState) {
    if (typeof window === "undefined")
        return;
    window.localStorage.setItem(CLIENT_GOALS_STORAGE_KEY, JSON.stringify(g));
    window.dispatchEvent(new Event(CLIENT_GOALS_UPDATE_EVENT));
}
