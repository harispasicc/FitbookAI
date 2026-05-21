import type { Prisma } from "@prisma/client";

export type TrainerNotificationPrefs = {
  emailNewBooking: boolean;
  emailBookingConfirmed: boolean;
  emailBookingCancelled: boolean;
  emailDailyDigest: boolean;
};

export const defaultTrainerNotificationPrefs: TrainerNotificationPrefs = {
  emailNewBooking: true,
  emailBookingConfirmed: true,
  emailBookingCancelled: true,
  emailDailyDigest: false,
};

export function parseTrainerNotificationPrefs(
  raw: Prisma.JsonValue | null | undefined,
): TrainerNotificationPrefs {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...defaultTrainerNotificationPrefs };
  }
  const o = raw as Record<string, unknown>;
  return {
    emailNewBooking:
      typeof o.emailNewBooking === "boolean"
        ? o.emailNewBooking
        : defaultTrainerNotificationPrefs.emailNewBooking,
    emailBookingConfirmed:
      typeof o.emailBookingConfirmed === "boolean"
        ? o.emailBookingConfirmed
        : defaultTrainerNotificationPrefs.emailBookingConfirmed,
    emailBookingCancelled:
      typeof o.emailBookingCancelled === "boolean"
        ? o.emailBookingCancelled
        : defaultTrainerNotificationPrefs.emailBookingCancelled,
    emailDailyDigest:
      typeof o.emailDailyDigest === "boolean"
        ? o.emailDailyDigest
        : defaultTrainerNotificationPrefs.emailDailyDigest,
  };
}

export function toNotificationPrefsJson(
  prefs: TrainerNotificationPrefs,
): Prisma.InputJsonValue {
  return prefs;
}
