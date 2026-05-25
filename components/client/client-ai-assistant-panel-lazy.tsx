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
        className="rounded-2xl border-0 bg-gradient-to-br from-violet-500/[0.06] to-teal-500/[0.04] shadow-sm"
        minHeight="min-h-[10rem]"
      />
    ),
  },
);
