import type { Metadata } from "next";
import { ClientsView } from "@/components/dashboard/clients-view";
export const metadata: Metadata = {
    title: "Clients",
};
export default function ClientsPage() {
    return <ClientsView />;
}
