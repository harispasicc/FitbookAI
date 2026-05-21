import type { Metadata } from "next";
import { BrowseCoachesView } from "@/components/site/browse-coaches-view";
import { SitePublicHeader } from "@/components/site/site-public-header";
import { SiteFooter } from "@/components/site/site-footer";
import { loadCoaches } from "@/lib/load-coaches";

export const metadata: Metadata = {
  title: "Find coaches",
  description:
    "Browse FitBook AI coaches. Filter by specialty, format, and rating. Book sessions after sign-in.",
};

export default async function CoachesPage() {
  const { coaches, loadError } = await loadCoaches();

  return (
    <div className="min-h-screen min-w-0 bg-background text-foreground">
      <SitePublicHeader />
      <main>
        <BrowseCoachesView coaches={coaches} loadError={loadError} />
      </main>
      <SiteFooter />
    </div>
  );
}
