import type { Metadata } from "next";
import { ClientProfileView } from "@/components/client/client-profile-view";
export const metadata: Metadata = {
    title: "Profile",
    description: "Your FitBook client profile: name and contact preferences.",
};
export default function ClientProfilePage() {
    return <ClientProfileView />;
}
