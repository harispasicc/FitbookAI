import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/site-page-shell";
import { SiteFooter } from "@/components/site/site-footer";
import { fitnessImages } from "@/lib/media-urls";
export const metadata: Metadata = {
    title: "About us",
    description: "What FitBook AI is and who it is for.",
};
export default function AboutPage() {
    return (<>
      <SitePageShell title="About us" heroImage={{ src: fitnessImages.heroCoach, alt: "Coach working with a client in a studio" }}>
        <p>
          FitBook AI is a focused workspace for coaches and boutique studios: bookings on a calendar,
          client notes, lightweight analytics, and an AI assistant for routine messaging — without turning the
          product into a generic admin panel.
        </p>
        <p>
          You can extend FitBook AI with your own auth, payments, and integrations when you are ready to ship.
        </p>
      </SitePageShell>
      <SiteFooter />
    </>);
}
