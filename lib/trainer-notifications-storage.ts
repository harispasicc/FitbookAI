const STORAGE_PREFIX = "fitbook-trainer-notifications-read";

function storageKey(email: string) {
  return `${STORAGE_PREFIX}:${email.trim().toLowerCase()}`;
}

export function readTrainerNotificationReadIds(email: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(storageKey(email));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export function writeTrainerNotificationReadIds(email: string, ids: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(email), JSON.stringify([...ids]));
}

export function markTrainerNotificationRead(email: string, id: string) {
  const ids = readTrainerNotificationReadIds(email);
  ids.add(id);
  writeTrainerNotificationReadIds(email, ids);
}

export function markAllTrainerNotificationsRead(email: string, notificationIds: string[]) {
  const ids = readTrainerNotificationReadIds(email);
  for (const id of notificationIds) ids.add(id);
  writeTrainerNotificationReadIds(email, ids);
}
