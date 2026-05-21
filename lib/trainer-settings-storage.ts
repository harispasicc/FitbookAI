const KEY = "fitbook-trainer-settings-v1";

export type TrainerNotificationPrefs = {
  emailNewBooking: boolean;
  emailBookingConfirmed: boolean;
  emailBookingCancelled: boolean;
  emailDailyDigest: boolean;
};

export type TrainerIntegrationPrefs = {
  googleCalendarConnected: boolean;
  stripeConnected: boolean;
};

export type TrainerWorkspacePrefs = {
  sessionBufferMinutes: number;
  defaultLocation: string;
};

export type TrainerSettingsPrefs = {
  notifications: TrainerNotificationPrefs;
  integrations: TrainerIntegrationPrefs;
  workspace: TrainerWorkspacePrefs;
};

export const defaultTrainerSettingsPrefs: TrainerSettingsPrefs = {
  notifications: {
    emailNewBooking: true,
    emailBookingConfirmed: true,
    emailBookingCancelled: true,
    emailDailyDigest: false,
  },
  integrations: {
    googleCalendarConnected: false,
    stripeConnected: false,
  },
  workspace: {
    sessionBufferMinutes: 15,
    defaultLocation: "",
  },
};

type Stored = Record<string, TrainerSettingsPrefs>;

function readAll(): Stored {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Stored;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(data: Stored) {
  window.localStorage.setItem(KEY, JSON.stringify(data));
}

export function readTrainerSettingsPrefs(email: string): TrainerSettingsPrefs {
  const row = readAll()[email.toLowerCase()];
  if (!row) return structuredClone(defaultTrainerSettingsPrefs);
  return {
    notifications: { ...defaultTrainerSettingsPrefs.notifications, ...row.notifications },
    integrations: { ...defaultTrainerSettingsPrefs.integrations, ...row.integrations },
    workspace: { ...defaultTrainerSettingsPrefs.workspace, ...row.workspace },
  };
}

export function writeTrainerSettingsPrefs(email: string, next: TrainerSettingsPrefs) {
  const all = readAll();
  all[email.toLowerCase()] = next;
  writeAll(all);
}
