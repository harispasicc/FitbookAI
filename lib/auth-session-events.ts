export const AUTH_SESSION_EXPIRED_EVENT = "fitbook-auth-session-expired";
const SESSION_EXPIRED_STORAGE_KEY = "fitbook-session-expired";
const POST_LOGOUT_REDIRECT_KEY = "fitbook-post-logout";

export function markSessionExpired() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_EXPIRED_STORAGE_KEY, "1");
  } catch {}
}

export function consumeSessionExpiredFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const value = sessionStorage.getItem(SESSION_EXPIRED_STORAGE_KEY);
    if (value) {
      sessionStorage.removeItem(SESSION_EXPIRED_STORAGE_KEY);
      return true;
    }
  } catch {}
  return false;
}

export function clearSessionExpiredFlag() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_EXPIRED_STORAGE_KEY);
  } catch {}
}

export function markPostLogoutRedirect() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(POST_LOGOUT_REDIRECT_KEY, "1");
  } catch {}
}

export function consumePostLogoutRedirect(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const value = sessionStorage.getItem(POST_LOGOUT_REDIRECT_KEY);
    if (value) {
      sessionStorage.removeItem(POST_LOGOUT_REDIRECT_KEY);
      return true;
    }
  } catch {}
  return false;
}

export function notifyAuthSessionExpired() {
  if (typeof window === "undefined") return;
  markSessionExpired();
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
}

export function isUnauthorizedStatus(status: number) {
  return status === 401;
}
