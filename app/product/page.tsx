import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/site-page-shell";
import { SiteFooter } from "@/components/site/site-footer";
import { fitnessImages } from "@/lib/media-urls";

export const metadata: Metadata = {
  title: "Services",
  description: "What FitBook AI helps coaches and clients do every day.",
};

export default function ProductServicesPage() {
  return (
    <>
      <SitePageShell
        title="Services"
        heroImage={{
          src: fitnessImages.coachClipboard,
          alt: "Coach planning sessions and availability",
        }}
        maxWidth="wide"
      >
        <p>
          FitBook AI is built around a short list of jobs that matter for small
          coaching businesses.
        </p>

        <p>
          <strong className="text-foreground">For clients</strong>
        </p>
        <ul className="list-inside list-disc space-y-2 pl-1">
          <li>
            <span className="font-medium text-foreground">Find coaches</span>:
            browse profiles, specialties, reviews, and services before you
            commit.
          </li>
          <li>
            <span className="font-medium text-foreground">Book sessions</span>:
            pick a service and an open slot; your coach confirms when they are
            ready.
          </li>
          <li>
            <span className="font-medium text-foreground">My dashboard</span>:
            upcoming and past sessions, goals, progress, profile, and in-app
            notifications.
          </li>
          <li>
            <span className="font-medium text-foreground">
              FitBook AI assistant
            </span>
            : ask about bookings, goals, and your coach with daily usage limits
            in the demo.
          </li>
        </ul>

        <p>
          <strong className="text-foreground">For coaches</strong>
        </p>
        <ul className="list-inside list-disc space-y-2 pl-1">
          <li>
            <span className="font-medium text-foreground">
              Calendar and bookings
            </span>
            : week view, session statuses, reschedule, and a live list of
            requests.
          </li>
          <li>
            <span className="font-medium text-foreground">
              Clients and services
            </span>
            : roster from real bookings, private notes, and service catalog with
            open times on your profile.
          </li>
          <li>
            <span className="font-medium text-foreground">AI workspace</span>:
            draft workouts, reminders, progress summaries, and re-engagement
            messages (Pro plan in the demo).
          </li>
          <li>
            <span className="font-medium text-foreground">Analytics</span>:
            bookings, revenue-style totals, active clients, and retention-style
            signals for the last 30 days.
          </li>
          <li>
            <span className="font-medium text-foreground">Plans</span>: Free,
            Pro, and AI Pro tiers gate advanced calendar, analytics, and AI
            features so you can demo upgrades.
          </li>
        </ul>
      </SitePageShell>
      <SiteFooter />
    </>
  );
}
