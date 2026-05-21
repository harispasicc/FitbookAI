"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { useTrainerPlan } from "@/hooks/use-trainer-plan";
import { orangeNoticeStyles } from "@/lib/notice-banner-styles";
import { TRAINER_PLANS } from "@/lib/trainer-plans";
import { cn } from "@/lib/utils";

export function TrainerPlanBanner() {
  const { planContext, plan } = useTrainerPlan();

  if (!planContext || plan !== "free") return null;

  const { clientCount, maxClients, clientsRemaining } = planContext;
  if (maxClients === null) return null;

  const nearLimit = clientsRemaining !== null && clientsRemaining <= 3;

  if (!nearLimit && clientCount < maxClients * 0.7) return null;

  return (
    <div
      className={cn(
        "px-4 py-3 text-sm",
        nearLimit && clientsRemaining === 0
          ? orangeNoticeStyles.root
          : "rounded-xl border border-border/80 bg-muted/30",
      )}
    >
      <p
        className={cn(
          "flex flex-wrap items-center gap-2 font-medium",
          nearLimit && clientsRemaining === 0
            ? orangeNoticeStyles.title
            : "text-foreground",
        )}
      >
        <Users className="size-4 shrink-0 text-primary" aria-hidden />
        {clientsRemaining === 0 ? (
          <>Client limit reached ({maxClients} on {TRAINER_PLANS.free.name})</>
        ) : (
          <>
            {clientCount} / {maxClients} clients on {TRAINER_PLANS.free.name}
            {clientsRemaining !== null ? ` · ${clientsRemaining} slots left` : null}
          </>
        )}
        <Link href="/coach/pricing" className="ml-auto text-primary underline-offset-2 hover:underline">
          Upgrade to Pro
        </Link>
      </p>
    </div>
  );
}
