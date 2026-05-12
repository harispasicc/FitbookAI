import type { Metadata } from "next";
import { SitePageShell } from "@/components/site/site-page-shell";
import { SiteFooter } from "@/components/site/site-footer";
import { fitnessImages } from "@/lib/media-urls";
export const metadata: Metadata = {
    title: "Privacy & policy",
    description: "Privacy, cookies, and terms for this FitBook AI build.",
};
export default function PrivacyPage() {
    return (<>
      <SitePageShell title="Privacy & policy" heroImage={{ src: fitnessImages.deskDocument, alt: "Notebook and pen on a desk" }}>
        <p>
          <strong className="text-foreground">Privacy.</strong> This portfolio build does not run a production
          backend. Sign-in stores a minimal profile in your browser (localStorage) for the dashboard experience only.
          Do not enter sensitive production data.
        </p>
        <p>
          <strong className="text-foreground">Cookies.</strong> Only what your host and tooling add by default. There
          is no advertising pixel layer in this repository.
        </p>
        <p>
          <strong className="text-foreground">Terms.</strong> The UI is provided as-is for evaluation and extension.
          Replace this page with counsel-reviewed legal copy before you onboard paying customers.
        </p>
      </SitePageShell>
      <SiteFooter />
    </>);
}
