import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoachProfileView } from "@/components/site/coach-profile-view";
import { SitePublicHeader } from "@/components/site/site-public-header";
import { SiteFooter } from "@/components/site/site-footer";
import { loadCoachById } from "@/lib/load-coaches";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const trainer = await loadCoachById(id);
  if (!trainer) {
    return { title: "Coach" };
  }
  return {
    title: `${trainer.name} — coach profile`,
    description: trainer.bio,
  };
}

export default async function CoachProfilePage({ params }: PageProps) {
  const { id } = await params;
  const trainer = await loadCoachById(id);

  if (!trainer) {
    notFound();
  }

  return (
    <div className="min-h-screen min-w-0 bg-background text-foreground">
      <SitePublicHeader />
      <main>
        <CoachProfileView trainer={trainer} />
      </main>
      <SiteFooter />
    </div>
  );
}
