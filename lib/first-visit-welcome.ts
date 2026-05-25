const STORAGE_KEY = "fitbook-just-signed-up";

export function markJustSignedUp(userId: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, userId);
}

export function isJustSignedUp(userId: string): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEY) === userId;
}

export function clearJustSignedUp(userId: string) {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(STORAGE_KEY) === userId) {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}
