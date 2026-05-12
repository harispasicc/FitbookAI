const KEY = "fitbook-trainer-profile-v1";
export type TrainerProfileExtension = {
    headline: string;
    phone: string;
    city: string;
    timezone: string;
    bio: string;
};
export const defaultTrainerProfileExtension: TrainerProfileExtension = {
    headline: "Strength & conditioning coach",
    phone: "",
    city: "",
    timezone: "Europe/Sarajevo",
    bio: "",
};
type Stored = Record<string, TrainerProfileExtension>;
function readAll(): Stored {
    if (typeof window === "undefined")
        return {};
    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw)
            return {};
        const p = JSON.parse(raw) as Stored;
        return p && typeof p === "object" ? p : {};
    }
    catch {
        return {};
    }
}
function writeAll(data: Stored) {
    window.localStorage.setItem(KEY, JSON.stringify(data));
}
export function readTrainerProfileExtension(email: string): TrainerProfileExtension {
    const all = readAll();
    const row = all[email.toLowerCase()];
    if (!row)
        return { ...defaultTrainerProfileExtension };
    return {
        ...defaultTrainerProfileExtension,
        ...row,
    };
}
export function writeTrainerProfileExtension(email: string, next: TrainerProfileExtension) {
    const all = readAll();
    all[email.toLowerCase()] = next;
    writeAll(all);
}
