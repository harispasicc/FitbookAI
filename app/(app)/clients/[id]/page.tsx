import type { Metadata } from "next";
import { ClientDetailView } from "@/components/dashboard/client-detail-view";
export const metadata: Metadata = {
    title: "Client",
};
export default function ClientDetailPage() {
    return <ClientDetailView />;
}
