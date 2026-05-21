"use client";

import type { ReactNode } from "react";
import {
  type TrainerPlanFeatureKey,
  type TrainerPlanId,
} from "@/lib/trainer-plans";
import { useTrainerPlan } from "@/hooks/use-trainer-plan";
import { LoadingPlaceholder } from "@/components/ui/busy-dots";
import { PlanUpgradePrompt } from "@/components/dashboard/plan-upgrade-prompt";

type PlanGateProps = {
  children: ReactNode;
  feature?: TrainerPlanFeatureKey;
  minPlan?: TrainerPlanId;
  title?: string;
  description?: string;
};

export function PlanGate({
  children,
  feature,
  minPlan = "pro",
  title,
  description,
}: PlanGateProps) {
  const { loading, canAccessFeature, meetsPlan } = useTrainerPlan();

  if (loading) {
    return <LoadingPlaceholder minHeight="min-h-[12rem]" />;
  }

  const allowed = feature ? canAccessFeature(feature) : meetsPlan(minPlan);
  if (allowed) return <>{children}</>;

  return (
    <div className="min-w-0 space-y-6">
      <PlanUpgradePrompt
        requiredPlan={minPlan}
        feature={feature}
        title={title}
        description={description}
      />
    </div>
  );
}
