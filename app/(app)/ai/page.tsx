import type { Metadata } from "next";
import { TrainerAiToolsView } from "@/components/dashboard/trainer-ai-tools-view";
export const metadata: Metadata = {
    title: "AI Assistant",
};
export default function AiAssistantPage() {
    return <TrainerAiToolsView />;
}
