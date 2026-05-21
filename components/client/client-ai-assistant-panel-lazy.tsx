"use client";

import dynamic from "next/dynamic";
import { LoadingPlaceholder } from "@/components/ui/busy-dots";

export const ClientAiAssistantPanelLazy = dynamic(
  () =>
    import("@/components/client/client-ai-assistant-panel").then(
      (m) => m.ClientAiAssistantPanel,
    ),
  {
    ssr: false,
    loading: () => (
      <LoadingPlaceholder
        className="rounded-2xl border border-border/80 bg-card"
        minHeight="min-h-[10rem]"
      />
    ),
  },
);
