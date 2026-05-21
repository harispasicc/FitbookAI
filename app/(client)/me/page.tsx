import type { Metadata } from "next";
import { ClientHomeView } from "@/components/client/client-home-view";
export const metadata: Metadata = {
    title: "My FitBook",
    description: "Your FitBook AI client home: coach, sessions, and progress.",
};
export default function ClientMePage() {
    return <ClientHomeView />;
}
