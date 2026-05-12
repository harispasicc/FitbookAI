import type { Metadata } from "next";
import { ClientProgressView } from "@/components/client/client-progress-view";
export const metadata: Metadata = {
    title: "Progress",
    description: "Track your training progress in FitBook AI.",
};
export default function ClientProgressPage() {
    return <ClientProgressView />;
}
