export type ClientProfileExtension = {
    headline: string;
    phone: string;
    city: string;
    timezone: string;
    bio: string;
};
export const defaultClientProfileExtension: ClientProfileExtension = {
    headline: "",
    phone: "",
    city: "",
    timezone: "Europe/Sarajevo",
    bio: "",
};
const storagePrefix = "fitbook-client-profile-ext:";
export function readClientProfileExtension(email: string): ClientProfileExtension {
    if (typeof window === "undefined")
        return defaultClientProfileExtension;
    try {
        const raw = window.localStorage.getItem(storagePrefix + email.toLowerCase());
        if (!raw)
            return defaultClientProfileExtension;
        const parsed = JSON.parse(raw) as Partial<ClientProfileExtension>;
        return {
            headline: typeof parsed.headline === "string" ? parsed.headline : defaultClientProfileExtension.headline,
            phone: typeof parsed.phone === "string" ? parsed.phone : "",
            city: typeof parsed.city === "string" ? parsed.city : "",
            timezone: typeof parsed.timezone === "string" ? parsed.timezone : defaultClientProfileExtension.timezone,
            bio: typeof parsed.bio === "string" ? parsed.bio : "",
        };
    }
    catch {
        return defaultClientProfileExtension;
    }
}
export function writeClientProfileExtension(email: string, ext: ClientProfileExtension): void {
    if (typeof window === "undefined")
        return;
    window.localStorage.setItem(storagePrefix + email.toLowerCase(), JSON.stringify(ext));
}
