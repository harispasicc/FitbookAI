import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoachProfileView } from "@/components/site/coach-profile-view";
import { SitePublicHeader } from "@/components/site/site-public-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getTrainerById, MOCK_TRAINERS } from "@/lib/mock-trainers";
type PageProps = {
    params: Promise<{
        id: string;
    }>;
};
export function generateStaticParams() {
    return MOCK_TRAINERS.map((t) => ({ id: t.id }));
}
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const trainer = getTrainerById(id);
    if (!trainer)
        return { title: "Coach" };
    return {
        title: `${trainer.name} — coach profile`,
        description: trainer.bio,
    };
}
export default async function CoachProfilePage({ params }: PageProps) {
    const { id } = await params;
    const trainer = getTrainerById(id);
    if (!trainer)
        notFound();
    return (<div className="min-h-screen min-w-0 bg-background text-foreground">
      <SitePublicHeader />
      <main>
        <CoachProfileView trainer={trainer}/>
      </main>
      <SiteFooter />
    </div>);
}
