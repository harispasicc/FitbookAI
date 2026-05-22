import type { Metadata } from "next";
import { TrainerAiToolsView } from "@/components/dashboard/trainer-ai-tools-view";
import { PlanGate } from "@/components/dashboard/plan-gate";

export const metadata: Metadata = {
  title: "AI Assistant",
};

export default function AiAssistantPage() {
  return (
    <PlanGate
      minPlan="pro"
      feature="aiAssistant"
      title="AI Assistant requires Pro"
      description="Workout drafts, reminders, and progress summaries are included on the Pro plan."
    >
      <TrainerAiToolsView />
    </PlanGate>
  );
}
