import type { Metadata } from "next";
import { TrainerProfilePageView } from "@/components/dashboard/trainer-profile-page-view";
export const metadata: Metadata = {
    title: "Profile",
};
export default function TrainerProfilePage() {
    return <TrainerProfilePageView />;
}
