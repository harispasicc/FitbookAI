import type { Metadata } from "next";
import { HowItWorksContent } from "@/components/site/how-it-works-content";
import { SitePublicHeader } from "@/components/site/site-public-header";
import { SiteFooter } from "@/components/site/site-footer";
export const metadata: Metadata = {
    title: "How it works",
    description: "Find a coach, book sessions, and track progress — plus coach tools for scheduling, AI, and client management.",
};
export default function HowItWorksPage() {
    return (<>
      <div className="min-h-screen min-w-0 bg-background">
        <SitePublicHeader />
        <main>
          <HowItWorksContent />
        </main>
      </div>
      <SiteFooter />
    </>);
}
