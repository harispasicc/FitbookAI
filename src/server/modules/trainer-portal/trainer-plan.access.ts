import { ApiError } from "@/server/http/api-error";
import {
  hasTrainerFeature,
  prismaPlanToApp,
  TRAINER_PLANS,
  type TrainerPlanFeatureKey,
  type TrainerPlanId,
} from "@/lib/trainer-plans";
import type { TrainerPlan } from "@prisma/client";
import { trainerPortalRepository } from "@/server/modules/trainer-portal/trainer-portal.repository";

export type TrainerPlanContext = {
  plan: TrainerPlanId;
  planName: string;
  priceLabel: string;
  maxClients: number | null;
  clientCount: number;
  clientsRemaining: number | null;
  features: (typeof TRAINER_PLANS)[TrainerPlanId]["features"];
};

export async function getTrainerPlanContext(
  trainerProfileId: string,
  plan: TrainerPlan | null | undefined,
): Promise<TrainerPlanContext> {
  const planId = prismaPlanToApp(plan ?? "FREE");
  const def = TRAINER_PLANS[planId];
  const clientCount =
    await trainerPortalRepository.countDistinctClients(trainerProfileId);

  const clientsRemaining =
    def.maxClients === null ? null : Math.max(0, def.maxClients - clientCount);

  return {
    plan: planId,
    planName: def.name,
    priceLabel: def.priceLabel,
    maxClients: def.maxClients,
    clientCount,
    clientsRemaining,
    features: def.features,
  };
}

export function assertTrainerFeature(
  plan: TrainerPlan,
  feature: TrainerPlanFeatureKey,
  message?: string,
) {
  const planId = prismaPlanToApp(plan);
  if (hasTrainerFeature(planId, feature)) return;

  const required =
    feature === "aiAssistant" ||
    feature === "aiScheduling" ||
    feature === "aiMealPlans"
      ? "AI Pro"
      : "Pro";

  throw ApiError.forbidden(
    message ?? `${required} plan required for this feature.`,
  );
}

export async function assertClientLimit(
  trainerProfileId: string,
  plan: TrainerPlan,
) {
  const ctx = await getTrainerPlanContext(trainerProfileId, plan);
  if (ctx.maxClients === null) return ctx;
  if (ctx.clientCount < ctx.maxClients) return ctx;

  throw ApiError.forbidden(
    `Free plan supports up to ${ctx.maxClients} clients. Upgrade to Pro for unlimited clients.`,
  );
}
