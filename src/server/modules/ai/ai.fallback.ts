import type { ClientKnowledgeBase } from "@/server/modules/ai/client-knowledge";
import type { TrainerToolType } from "./ai.schemas";

export type ClientAiContext = ClientKnowledgeBase | null;

function coachName(ctx: ClientKnowledgeBase) {
  return ctx.selectedCoach?.fullName ?? null;
}

function upcomingBookings(ctx: ClientKnowledgeBase) {
  const now = Date.now();
  return ctx.bookings.items.filter(
    (b) =>
      new Date(b.startsAt).getTime() >= now &&
      (b.status === "pending" || b.status === "confirmed"),
  );
}

function topSuggestedCoaches(ctx: ClientKnowledgeBase) {
  return [...ctx.coachesCatalog]
    .sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
    .slice(0, 3)
    .map((c) => ({
      ...c,
      matchReason:
        ctx.goals?.active && c.specialty
          ? `Listed on FitBook. Check fit for ${ctx.goals.active}`
          : "Available on FitBook",
    }));
}

function formatSlotTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatSlotTimeShort(iso: string | Date) {
  return new Date(iso).toLocaleString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function startOfLocalDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfLocalDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

type SlotTimeFilter = {
  dayStart?: Date;
  dayEnd?: Date;
  minHour?: number;
  minMinute?: number;
  label: string;
};

function parseHourAfter(
  hour: number,
  minute: number,
  meridiem?: string,
): { hour: number; minute: number } {
  if (!meridiem) {
    return hour >= 1 && hour <= 11 ? { hour: hour + 12, minute } : { hour, minute };
  }
  const m = meridiem.toLowerCase();
  if (m === "pm" && hour < 12) return { hour: hour + 12, minute };
  if (m === "am" && hour === 12) return { hour: 0, minute };
  return { hour, minute };
}

/** Parse natural availability constraints from the user message (local timezone). */
function parseSlotTimeFilter(message: string, now = new Date()): SlotTimeFilter | null {
  const t = message.trim().toLowerCase();
  const parts: string[] = [];
  const filter: SlotTimeFilter = { label: "" };

  if (/\btomorrow\b|\bsutra\b|\bnext day\b/.test(t)) {
    const day = new Date(now);
    day.setDate(day.getDate() + 1);
    filter.dayStart = startOfLocalDay(day);
    filter.dayEnd = endOfLocalDay(day);
    parts.push("tomorrow");
  } else if (/\btoday\b|\bdanas\b/.test(t) && !filter.dayStart) {
    filter.dayStart = startOfLocalDay(now);
    filter.dayEnd = endOfLocalDay(now);
    parts.push("today");
  }

  const afterMatch = t.match(
    /\bafter\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/,
  );
  if (afterMatch) {
    const hour = Number(afterMatch[1]);
    const minute = afterMatch[2] ? Number(afterMatch[2]) : 0;
    const parsed = parseHourAfter(hour, minute, afterMatch[3]);
    filter.minHour = parsed.hour;
    filter.minMinute = parsed.minute;
    parts.push(`after ${formatSlotTimeShort(new Date(2000, 0, 1, parsed.hour, parsed.minute))}`);
  } else if (/\bafter\s+5\s*pm\b|\bafter\s+5pm\b|\bposlije\s+17\b|\bafter\s+17\b/.test(t)) {
    filter.minHour = 17;
    filter.minMinute = 0;
    parts.push("after 5:00 PM");
  }

  if (parts.length === 0) {
    return null;
  }

  filter.label = parts.join(", ");
  return filter;
}

function slotMatchesFilter(startsAtIso: string, filter: SlotTimeFilter): boolean {
  const d = new Date(startsAtIso);
  if (filter.dayStart && filter.dayEnd) {
    if (d < filter.dayStart || d > filter.dayEnd) {
      return false;
    }
  }
  if (filter.minHour !== undefined) {
    const h = d.getHours();
    const m = d.getMinutes();
    const minM = filter.minMinute ?? 0;
    if (h < filter.minHour || (h === filter.minHour && m < minM)) {
      return false;
    }
  }
  return true;
}

function formatMatchingSlotsReply(
  coachLabel: string,
  matching: { startsAt: string }[],
  timeFilter: SlotTimeFilter,
): string {
  const times = matching.map((s) => `**${formatSlotTimeShort(s.startsAt)}**`);
  const timeLine =
    times.length === 1
      ? times[0]
      : times.length === 2
        ? `${times[0]} and ${times[1]}`
        : `${times.slice(0, -1).join(", ")}, and ${times[times.length - 1]}`;

  return `For ${coachLabel} (${timeFilter.label}), you have availability at ${timeLine}.\n\nOpen their profile and tap **Book a session** to reserve a slot.`;
}

function formatPrice(cents: number) {
  const euros = cents / 100;
  return euros % 1 === 0 ? `€${euros}` : `€${euros.toFixed(2)}`;
}

function isAvailabilityQuestion(text: string) {
  return (
    text.includes("slot") ||
    text.includes("termin") ||
    text.includes("available") ||
    text.includes("availability") ||
    text.includes("slobod") ||
    text.includes("free time") ||
    text.includes("when can i book") ||
    (text.includes("book") &&
      (text.includes("when") ||
        text.includes("time") ||
        text.includes("available")))
  );
}

function isSpecialtyQuestion(text: string) {
  return (
    text.includes("specialt") ||
    text.includes("specijal") ||
    text.includes("expertise") ||
    text.includes("type of training") ||
    text.includes("kind of training") ||
    text.includes("training does she") ||
    text.includes("training does he") ||
    text.includes("what does she offer") ||
    text.includes("what does he offer") ||
    text.includes("what does she provide") ||
    text.includes("what does he provide") ||
    (text.includes("what") &&
      text.includes("training") &&
      (text.includes("provide") ||
        text.includes("offer") ||
        text.includes("do") ||
        text.includes("teach"))) ||
    (text.includes("she") &&
      (text.includes("provide") || text.includes("offer")) &&
      (text.includes("training") || text.includes("session") || text.includes("service"))) ||
    (text.includes("focus") && text.includes("train")) ||
    (text.includes("related") && text.includes("train")) ||
    (text.includes("service") &&
      (text.includes("offer") || text.includes("provide") || text.includes("book")))
  );
}

function isRatingQuestion(text: string) {
  return (
    text.includes("rating") ||
    text.includes("review") ||
    text.includes("star") ||
    text.includes("ocjena") ||
    text.includes("rated")
  );
}

function isPriceQuestion(text: string) {
  return (
    text.includes("price") ||
    text.includes("cost") ||
    text.includes("fee") ||
    text.includes("cijena") ||
    text.includes("how much") ||
    text.includes("charge") ||
    (text.includes("session") &&
      (text.includes("price") || text.includes("cost") || text.includes("much")))
  );
}

function isCoachSuggestionQuestion(text: string) {
  return (
    text.includes("suggest") ||
    text.includes("recommend") ||
    text.includes("predlo") ||
    text.includes("preporu") ||
    text.includes("which coach") ||
    text.includes("which trainer") ||
    text.includes("pick a coach") ||
    text.includes("choose a coach") ||
    text.includes("find me a coach") ||
    text.includes("find a coach") ||
    text.includes("koji trener") ||
    text.includes("koga bi") ||
    (text.includes("who") &&
      (text.includes("suggest") ||
        text.includes("recommend") ||
        text.includes("pick") ||
        text.includes("choose"))) ||
    (text.includes("who should") &&
      (text.includes("coach") || text.includes("trainer") || text.includes("trener")))
  );
}

function isCoachIdentityQuestion(text: string) {
  if (
    isAvailabilityQuestion(text) ||
    isSpecialtyQuestion(text) ||
    isRatingQuestion(text) ||
    isPriceQuestion(text) ||
    isCoachSuggestionQuestion(text)
  ) {
    return false;
  }
  return (
    (text.includes("who") &&
      (text.includes("my") || text.includes("mi") || text.includes("moj")) &&
      (text.includes("coach") || text.includes("trainer") || text.includes("trener"))) ||
    (text.includes("ko") &&
      (text.includes("mi") || text.includes("moj")) &&
      (text.includes("trener") || text.includes("coach")))
  );
}

function availabilityFallbackReply(
  context: ClientKnowledgeBase,
  message?: string,
): string {
  const name = coachName(context);
  if (!name || !context.selectedCoach) {
    return "You have not selected a coach yet. Go to **Find coaches**, pick a trainer, then ask again about available times.";
  }

  const coach = `**${name}**`;
  const slots = context.selectedCoach.openSlots ?? [];

  if (slots.length === 0) {
    return `There are no open booking slots for ${coach} in the next **60 days**. Check their profile later.`;
  }

  const timeFilter = message ? parseSlotTimeFilter(message) : null;
  if (timeFilter) {
    const matching = slots.filter((s) => slotMatchesFilter(s.startsAt, timeFilter));
    if (matching.length > 0) {
      return formatMatchingSlotsReply(coach, matching.slice(0, 6), timeFilter);
    }

    const nearest = slots.slice(0, 4).map((s) => `- ${formatSlotTime(s.startsAt)}`);
    return `No open slots with ${coach} for **${timeFilter.label}**. Here are the next available times:\n\n${nearest.join("\n")}\n\nOpen their profile to see all slots or pick another day.`;
  }

  const preview = slots.slice(0, 5);
  const lines = preview.map((s) => `- ${formatSlotTime(s.startsAt)}`);
  const more =
    slots.length > preview.length
      ? `\n\n_${slots.length - preview.length} more on their profile._`
      : "";
  return `Open slots with ${coach} (next ${preview.length} shown):\n\n${lines.join("\n")}${more}\n\nOpen their profile and tap **Book a session** to reserve one.`;
}

function specialtyFallbackReply(context: ClientKnowledgeBase): string {
  const coach = context.selectedCoach;
  if (!coach?.fullName) {
    return "You have not selected a coach yet. Browse **Find coaches** to see each trainer's specialty.";
  }

  const specialty = coach.specialty ?? "General fitness coaching";
  const bio = coach.bio?.trim();
  const intro = `**${coach.fullName}** focuses on **${specialty}**.`;
  const serviceLines =
    coach.services.length > 0
      ? coach.services.map(
          (s) =>
            `- **${s.title}** (${s.durationMinutes} min, ${formatPrice(s.priceCents)})${s.description ? `: ${s.description}` : ""}`,
        )
      : [];

  const servicesBlock =
    serviceLines.length > 0
      ? `\n\nSessions she offers:\n${serviceLines.join("\n")}`
      : "";

  if (bio) {
    return `${intro}${servicesBlock}\n\n${bio}`;
  }
  if (servicesBlock) {
    return `${intro}${servicesBlock}\n\nOpen her profile under **Find coaches** to book a session.`;
  }
  return `${intro} This typically covers structured strength work, progression planning, and session coaching in that area.`;
}

function ratingFallbackReply(context: ClientKnowledgeBase): string {
  const coach = context.selectedCoach;
  if (!coach?.fullName) {
    return "You have not selected a coach yet. Coach ratings are shown on each profile under **Find coaches**.";
  }

  const { averageRating: average, reviewCount } = coach;
  if (reviewCount === 0 || average === null) {
    return `**${coach.fullName}** does not have client reviews yet.`;
  }
  return `**${coach.fullName}** has an average rating of **${average}★** from **${reviewCount}** review${reviewCount === 1 ? "" : "s"}.`;
}

function coachSuggestionFallbackReply(context: ClientKnowledgeBase): string {
  const name = coachName(context);
  if (name) {
    const specialty = context.selectedCoach?.specialty
      ? ` (${context.selectedCoach.specialty})`
      : "";
    return `You are already linked with **${name}**${specialty}. To switch trainers, open **Find coaches** and pick someone new.`;
  }

  const suggestions = topSuggestedCoaches(context);
  if (suggestions.length === 0) {
    return "Browse **Find coaches** to see all trainers, their specialties, and reviews. Then pick one and confirm them as your coach.";
  }

  const goalLabel = context.goals?.activeLabel
    ? `your **${context.goals.activeLabel}** goal`
    : "your goals";

  const lines = suggestions.map((c, i) => {
    const label = c.fullName ?? "Coach";
    const spec = c.specialty ? `, **${c.specialty}**` : "";
    const rating =
      c.reviewCount > 0 && c.averageRating !== null
        ? ` · **${c.averageRating}★** (${c.reviewCount} review${c.reviewCount === 1 ? "" : "s"})`
        : "";
    const price =
      c.minPriceCents !== null ? ` · from ${formatPrice(c.minPriceCents)}` : "";
    return `${i + 1}. **${label}**${spec}${rating}${price}\n   _${c.matchReason}_`;
  });

  return `You have not selected a coach yet. Based on ${goalLabel}, here are trainers worth a look:\n\n${lines.join("\n\n")}\n\nOpen **Find coaches**, open a profile, and book a first session. That links them as your coach.`;
}

function priceFallbackReply(context: ClientKnowledgeBase): string {
  const coach = context.selectedCoach;
  if (!coach?.fullName) {
    return "You have not selected a coach yet. Session prices are listed on each coach profile.";
  }

  const services = coach.services;
  if (services.length === 0) {
    return `**${coach.fullName}** has no active services listed right now. Check their profile for updates.`;
  }

  const lines = services.map(
    (s) =>
      `- **${s.title}**: ${formatPrice(s.priceCents)} (${s.durationMinutes} min)`,
  );
  return `Session prices with **${coach.fullName}**:\n\n${lines.join("\n")}\n\nPick a service when you **Book a session**.`;
}

export type ClientAssistantFallbackOptions = {
  /** OpenAI is configured but the live request failed — avoid "add API key" messaging. */
  openAiUnavailable?: boolean;
};

export function clientAssistantFallback(
  message: string,
  context: ClientAiContext,
  options?: ClientAssistantFallbackOptions,
): string {
  const t = message.trim().toLowerCase();

  if (!t) {
    return "Write a short question and I will help. Try one of the suggested prompts.";
  }

  if (!context) {
    return "I could not load your account data. Try signing in again.";
  }

  const next = upcomingBookings(context)[0];
  if (t.includes("next") && (t.includes("session") || t.includes("train"))) {
    if (next) {
      const when = formatSlotTime(next.startsAt);
      return `Your next session is **${next.service}** on ${when} (status: ${next.status}). See **Sessions** for the full list.`;
    }
    return "You have no upcoming confirmed sessions. Book from your coach profile under **Find coaches**.";
  }

  if (isAvailabilityQuestion(t)) {
    return availabilityFallbackReply(context, message);
  }

  if (isSpecialtyQuestion(t)) {
    return specialtyFallbackReply(context);
  }

  if (isRatingQuestion(t)) {
    return ratingFallbackReply(context);
  }

  if (isPriceQuestion(t)) {
    return priceFallbackReply(context);
  }

  if (t.includes("goal") || t.includes("progress")) {
    if (context.goals) {
      const pct = context.goals.pct[context.goals.active] ?? 0;
      const note = context.goals.notes[context.goals.active];
      const noteLine = note ? `\n\nYour target note: _${note}_` : "";
      return `Your active goal is **${context.goals.activeLabel}** at **${pct}%** completion.${noteLine} Open **Progress** to update.`;
    }
    return "Open **Progress** to set and track your goals.";
  }

  if (t.includes("notification") || t.includes("obavijest")) {
    const unread = context.notifications.unread;
    if (context.notifications.items.length === 0) {
      return "You have no notifications yet.";
    }
    const latest = context.notifications.items[0];
    return `You have **${unread}** unread notification${unread === 1 ? "" : "s"}. Latest: **${latest.title}**: ${latest.body}`;
  }

  if (t.includes("workout") || t.includes("trening")) {
    const { count, totalMinutes } = context.workouts.stats;
    if (count === 0) {
      return "No workouts logged yet. Your coach or you can add them under **Progress**.";
    }
    const last = context.workouts.items[0];
    return `You have **${count}** logged workouts (**${totalMinutes}** min total). Most recent: **${last.type}** on ${formatSlotTime(last.date)}.`;
  }

  if (isCoachSuggestionQuestion(t)) {
    return coachSuggestionFallbackReply(context);
  }

  if (isCoachIdentityQuestion(t)) {
    const name = coachName(context);
    if (name) {
      const specialty = context.selectedCoach?.specialty
        ? `, specialty: **${context.selectedCoach.specialty}**`
        : "";
      return `Your coach is **${name}**${specialty}. See the **My coach** card on your dashboard or open their profile to book a session.`;
    }
    return coachSuggestionFallbackReply(context);
  }

  if (t.includes("book")) {
    if (context.selectedCoach?.openSlots?.length) {
      return availabilityFallbackReply(context, message);
    }
    const coach = coachName(context) ? ` **${coachName(context)}**` : " a coach";
    return `Open **Find coaches**, choose${coach}, then **Book a session** to pick a service and time slot.`;
  }

  if (t.includes("hi") || t.includes("hello") || t.includes("zdravo") || t.includes("bok")) {
    return "Hi, I am **FitBook AI**. Ask me anything about your sessions, goals, coaches, or bookings.";
  }

  if (coachName(context)) {
    if (options?.openAiUnavailable) {
      return `I pulled this from your FitBook data, but the live AI service is temporarily unavailable. Try again in a moment, or ask about **sessions**, **goals**, **slots**, or **${coachName(context)}**'s services.`;
    }
    return `I can help with your sessions, goals, and coach (**${coachName(context)}**). Try: next session, available slots, training types, or session prices.`;
  }

  if (options?.openAiUnavailable) {
    return "The live AI service is temporarily unavailable. You can still ask about **sessions**, **goals**, **workouts**, or **coaches**.";
  }

  return "Ask me about **sessions**, **goals**, **workouts**, or **which coach to pick**.";
}

export function trainerToolFallback(
  tool: TrainerToolType,
  prompt: string,
  clientName?: string,
): string {
  const who = clientName?.trim() || "your client";

  switch (tool) {
    case "generate_workout":
      return `**Sample workout: ${who}** (offline preview)\n\n**Warm-up (8 min)**\n- Bike or brisk walk\n- Hip circles, band pull-aparts\n\n**Main**\n1. Goblet squat: 3×8 @ RPE 7\n2. Romanian deadlift: 3×8 @ RPE 7\n3. Split squat: 2×10 each leg\n\n**Finisher**\n- Farmer carry: 3×40m\n\n**Cooldown**\n- 5 min easy walk + breathing\n\n_Context: ${prompt.slice(0, 200)}_`;

    case "generate_reminder":
      return `Hi ${who.split(" ")[0] || "there"}, quick reminder about your upcoming session. Reply if you need to reschedule. See you soon!\n\n_(Draft based on: ${prompt.slice(0, 120)})_`;

    case "summarize_progress":
      return `**Progress brief: ${who}**\n\n- Attendance: review last 30 days in your calendar\n- Focus: ${prompt.slice(0, 160) || "steady consistency"}\n- Suggestion: celebrate wins, adjust volume if RPE trends high\n\n_Connect OpenAI for richer summaries from live data._`;

    case "reengagement_message":
      return `Hey ${who.split(" ")[0] || "there"}, hope you are well. We have not trained together in a little while and I would love to get you back on track. Want to book a short check-in this week?\n\n_(Tone: warm, no pressure; ${prompt.slice(0, 100)})_`;
  }
}
