import type { Metadata } from "next";
import { ServicesView } from "@/components/dashboard/services-view";
export const metadata: Metadata = {
    title: "Services",
};
export default function ServicesPage() {
    return <ServicesView />;
}
