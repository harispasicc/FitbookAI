import type { BookingDto } from "@/server/modules/bookings/bookings.dto";
import { sendEmail } from "@/server/email/send-email";
import {
  defaultTrainerNotificationPrefs,
  parseTrainerNotificationPrefs,
  type TrainerNotificationPrefs,
} from "@/server/email/trainer-notification-prefs";
import { prisma } from "@/lib/prisma";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

function sessionLine(booking: BookingDto) {
  const when = new Date(booking.startsAt).toLocaleString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return `${booking.service.title} · ${when}`;
}

async function trainerPrefs(
  trainerProfileId: string,
): Promise<TrainerNotificationPrefs> {
  const profile = await prisma.trainerProfile.findUnique({
    where: { id: trainerProfileId },
    select: { notificationPrefs: true },
  });
  return parseTrainerNotificationPrefs(profile?.notificationPrefs);
}

async function trainerEmail(trainerProfileId: string): Promise<string | null> {
  const row = await prisma.trainerProfile.findUnique({
    where: { id: trainerProfileId },
    select: { user: { select: { email: true } } },
  });
  return row?.user.email ?? null;
}

async function clientEmail(clientUserId: string): Promise<string | null> {
  const row = await prisma.user.findUnique({
    where: { id: clientUserId },
    select: { email: true },
  });
  return row?.email ?? null;
}

export async function notifyBookingCreated(booking: BookingDto) {
  const prefs = await trainerPrefs(booking.trainer.id);
  if (!prefs.emailNewBooking) return;

  const to = await trainerEmail(booking.trainer.id);
  if (!to) return;

  await sendEmail({
    to,
    subject: `New booking request — ${booking.client.name}`,
    html: `<p><strong>${booking.client.name}</strong> requested a session.</p><p>${sessionLine(booking)}</p><p><a href="${appUrl()}/calendar">Open calendar</a></p>`,
  });

  const clientTo = await clientEmail(booking.client.id);
  if (clientTo) {
    await sendEmail({
      to: clientTo,
      subject: `Booking request sent — ${booking.trainer.fullName ?? "your coach"}`,
      html: `<p>Your request is pending confirmation.</p><p>${sessionLine(booking)}</p><p><a href="${appUrl()}/me/sessions">View sessions</a></p>`,
    });
  }
}

export async function notifyBookingStatusChange(
  booking: BookingDto,
  previousStatus: BookingDto["status"],
) {
  const prefs = await trainerPrefs(booking.trainer.id);

  if (booking.status === "confirmed" && previousStatus === "pending") {
    const clientTo = await clientEmail(booking.client.id);
    if (clientTo) {
      await sendEmail({
        to: clientTo,
        subject: `Session confirmed — ${booking.trainer.fullName ?? "your coach"}`,
        html: `<p>Your session is confirmed.</p><p>${sessionLine(booking)}</p><p><a href="${appUrl()}/me/sessions">View sessions</a></p>`,
      });
    }
    if (prefs.emailBookingConfirmed) {
      const to = await trainerEmail(booking.trainer.id);
      if (to) {
        await sendEmail({
          to,
          subject: `Booking confirmed — ${booking.client.name}`,
          html: `<p>You confirmed a session with <strong>${booking.client.name}</strong>.</p><p>${sessionLine(booking)}</p>`,
        });
      }
    }
  }

  if (booking.status === "cancelled") {
    const clientTo = await clientEmail(booking.client.id);
    const trainerTo = await trainerEmail(booking.trainer.id);
    const line = sessionLine(booking);

    if (clientTo) {
      await sendEmail({
        to: clientTo,
        subject: `Session cancelled`,
        html: `<p>Your session was cancelled.</p><p>${line}</p>`,
      });
    }
    if (prefs.emailBookingCancelled && trainerTo) {
      await sendEmail({
        to: trainerTo,
        subject: `Booking cancelled — ${booking.client.name}`,
        html: `<p>Session cancelled for <strong>${booking.client.name}</strong>.</p><p>${line}</p>`,
      });
    }
  }

  if (booking.status === "completed") {
    const clientTo = await clientEmail(booking.client.id);
    if (clientTo) {
      await sendEmail({
        to: clientTo,
        subject: `How was your session? Leave a review`,
        html: `<p>Thanks for training with <strong>${booking.trainer.fullName ?? "your coach"}</strong>.</p><p><a href="${appUrl()}/me/sessions">Rate your session</a></p>`,
      });
    }
  }
}

export { defaultTrainerNotificationPrefs };
