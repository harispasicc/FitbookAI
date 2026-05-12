import { redirect } from "next/navigation";
type PageProps = {
    params: Promise<{
        id: string;
    }>;
};
export default async function LegacyTrainerProfileRedirect({ params }: PageProps) {
    const { id } = await params;
    redirect(`/coaches/${id}`);
}
