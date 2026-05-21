"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  requiredPlanLabel,
  TRAINER_PLANS,
  type TrainerPlanFeatureKey,
  type TrainerPlanId,
} from "@/lib/trainer-plans";
import { useTrainerPlan } from "@/hooks/use-trainer-plan";

type PlanUpgradePromptProps = {
  requiredPlan: TrainerPlanId;
  feature?: TrainerPlanFeatureKey;
  title?: string;
  description?: string;
};

export function PlanUpgradePrompt({
  requiredPlan,
  feature,
  title,
  description,
}: PlanUpgradePromptProps) {
  const { plan } = useTrainerPlan();
  const tier = TRAINER_PLANS[requiredPlan];
  const featureLabel = feature
    ? feature
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (c) => c.toUpperCase())
    : null;

  return (
    <Card className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-primary/[0.04] shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lock className="size-4 text-primary" aria-hidden />
          {title ?? `${tier.name} plan required`}
        </CardTitle>
        <CardDescription>
          {description ??
            (featureLabel
              ? `${featureLabel} is included on ${requiredPlanLabel(requiredPlan)} and above. You are on ${TRAINER_PLANS[plan].name}.`
              : `Upgrade to unlock this section. You are on ${TRAINER_PLANS[plan].name}.`)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button asChild className="rounded-xl">
          <Link href="/coach/pricing">View plans</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/settings">Change plan (demo)</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
