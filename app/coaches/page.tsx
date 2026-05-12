import type { Metadata } from "next";
import { BrowseCoachesView } from "@/components/site/browse-coaches-view";
import { SitePublicHeader } from "@/components/site/site-public-header";
import { SiteFooter } from "@/components/site/site-footer";
export const metadata: Metadata = {
    title: "Find coaches",
    description: "Browse FitBook AI coaches — filter by specialty, format, and rating. Book sessions after sign-in.",
};
export default function CoachesPage() {
    return (<div className="min-h-screen min-w-0 bg-background text-foreground">
      <SitePublicHeader />
      <main>
        <BrowseCoachesView />
      </main>
      <SiteFooter />
    </div>);
}
