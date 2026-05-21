import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/site-page-shell";
import { SiteFooter } from "@/components/site/site-footer";
import { fitnessImages } from "@/lib/media-urls";
export const metadata: Metadata = {
    title: "Privacy & policy",
    description: "Privacy, cookies, and terms of service for FitBook AI.",
};
export default function PrivacyPage() {
    return (<>
      <SitePageShell title="Privacy & policy" heroImage={{ src: fitnessImages.deskDocument, alt: "Notebook and pen on a desk" }}>
        <p>
          <strong className="text-foreground">Privacy.</strong> We store account and session data needed to run
          bookings, coach profiles, and your dashboard. Do not share passwords or sensitive health information in
          free-text fields unless your coach has asked for it in a secure channel.
        </p>
        <p>
          <strong className="text-foreground">Cookies.</strong> FitBook uses cookies for sign-in and security. We do
          not use advertising pixels in this product.
        </p>
        <p id="terms">
          <strong className="text-foreground">Terms of Service.</strong> FitBook is provided for coaching businesses
          and their clients. You are responsible for accurate profile information, respecting cancellation policies,
          and complying with local laws. We may update these terms as the product evolves.
        </p>
      </SitePageShell>
      <SiteFooter />
    </>);
}
