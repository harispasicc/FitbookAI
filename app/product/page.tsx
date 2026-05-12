import type { Metadata } from "next";
import Link from "next/link";
import { SitePageShell } from "@/components/site/site-page-shell";
import { SiteFooter } from "@/components/site/site-footer";
import { fitnessImages } from "@/lib/media-urls";
export const metadata: Metadata = {
    title: "Services",
    description: "What FitBook AI helps you run day to day.",
};
export default function ProductServicesPage() {
    return (<>
      <SitePageShell title="Services" heroImage={{ src: fitnessImages.coachClipboard, alt: "Coach planning sessions and availability" }}>
        <p>FitBook AI is organized around a few core surfaces:</p>
        <ul className="list-inside list-disc space-y-2 pl-1">
          <li>
            <span className="font-medium text-foreground">Calendar & bookings</span> — see what is coming up, keep
            sessions structured, and leave room for a real scheduler integration later.
          </li>
          <li>
            <span className="font-medium text-foreground">Clients & services</span> — roster, packages, and context
            so you are not jumping between spreadsheets.
          </li>
          <li>
            <span className="font-medium text-foreground">AI assistant</span> — draft reminders and answer repetitive
            questions with guardrails you control.
          </li>
          <li>
            <span className="font-medium text-foreground">Analytics</span> — bookings, revenue, and retention signals
            tuned for small teams.
          </li>
        </ul>
        <p>
          Need something custom for your studio? Use{" "}
          <Link href="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
            Contact
          </Link>{" "}
          and outline your workflow.
        </p>
      </SitePageShell>
      <SiteFooter />
    </>);
}
