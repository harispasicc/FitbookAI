import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/site-page-shell";
import { SiteFooter } from "@/components/site/site-footer";
import { fitnessImages } from "@/lib/media-urls";

export const metadata: Metadata = {
  title: "About us",
  description: "What FitBook AI is, who it is for, and how the platform works.",
};

export default function AboutPage() {
  return (
    <>
      <SitePageShell
        title="About us"
        heroImage={{
          src: fitnessImages.heroCoach,
          alt: "Coach working with a client in a studio",
        }}
        maxWidth="wide"
      >
        <p>
          FitBook AI connects people who train with independent coaches and
          small studios. Clients browse real profiles, book open slots, and
          track sessions in one place. Coaches run bookings, clients, and
          day-to-day admin from a single workspace instead of scattered chats
          and spreadsheets.
        </p>
        <p>
          <strong className="text-foreground">For clients.</strong> You can
          discover coaches by specialty and goal, request a session on their
          calendar, and see confirmations, reminders, and history under My
          sessions. Goals and progress stay on your account so you and your
          coach share the same picture between visits.
        </p>
        <p>
          <strong className="text-foreground">For coaches.</strong> You get a
          public profile on Find coaches, services with pricing, availability
          slots, and a dashboard for the week ahead. When someone books, you
          confirm or complete sessions, add private notes, and optionally use AI
          tools for reminders and workout drafts. Analytics summarize bookings
          and client activity without a separate reporting tool.
        </p>
      </SitePageShell>
      <SiteFooter />
    </>
  );
}
