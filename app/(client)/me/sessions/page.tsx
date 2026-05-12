import type { Metadata } from "next";
import { ClientSessionsView } from "@/components/client/client-sessions-view";
export const metadata: Metadata = {
    title: "Sessions",
    description: "Your upcoming and past training sessions.",
};
export default function ClientSessionsPage() {
    return <ClientSessionsView />;
}
