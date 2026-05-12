import type { Metadata } from "next";
import { TrainerDashboardView } from "@/components/dashboard/trainer-dashboard-view";
export const metadata: Metadata = {
    title: "Dashboard",
};
export default function DashboardHomePage() {
    return <TrainerDashboardView />;
}
