import type { Metadata } from "next";
import { ClientAiAssistantPanel } from "@/components/client/client-ai-assistant-panel";
export const metadata: Metadata = {
    title: "FitBook AI",
    description: "FitBook AI client assistant: booking hints and progress help.",
};
export default function ClientAiPage() {
    return (<div className="min-w-0 space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">FitBook AI</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Ask about sessions, goals, and how booking works. Your AI assistant for everyday training questions.
        </p>
      </div>
      <ClientAiAssistantPanel />
    </div>);
}
