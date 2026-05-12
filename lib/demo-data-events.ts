export const DEMO_DATA_UPDATE_EVENT = "fitbook-demo-updated";
export function notifyDemoDataUpdated() {
    if (typeof window === "undefined")
        return;
    window.dispatchEvent(new Event(DEMO_DATA_UPDATE_EVENT));
}
