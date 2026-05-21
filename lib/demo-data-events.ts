export const DEMO_DATA_UPDATE_EVENT = "fitbook-demo-updated";
export const BOOKINGS_UPDATE_EVENT = "fitbook-bookings-updated";
export const CLIENT_PORTAL_UPDATE_EVENT = "fitbook-client-portal-updated";

export function notifyClientPortalUpdated() {
    if (typeof window === "undefined")
        return;
    window.dispatchEvent(new Event(CLIENT_PORTAL_UPDATE_EVENT));
}

export function notifyDemoDataUpdated() {
    if (typeof window === "undefined")
        return;
    window.dispatchEvent(new Event(DEMO_DATA_UPDATE_EVENT));
}

export function notifyBookingsUpdated() {
    if (typeof window === "undefined")
        return;
    window.dispatchEvent(new Event(BOOKINGS_UPDATE_EVENT));
}
