import type { Metadata } from "next";
import { TrainerSettingsView } from "@/components/dashboard/trainer-settings-view";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return <TrainerSettingsView />;
}
