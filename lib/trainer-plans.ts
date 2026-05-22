export type TrainerPlanId = "free" | "pro" | "ai_pro";

export type TrainerPlanFeatureKey =
  | "basicCalendar"
  | "advancedCalendar"
  | "emailReminders"
  | "smsReminders"
  | "analytics"
  | "aiAssistant"
  | "aiScheduling"
  | "aiMealPlans"
  | "prioritySupport";

export type TrainerPlanDefinition = {
  id: TrainerPlanId;
  name: string;
  priceLabel: string;
  blurb: string;
  maxClients: number | null;
  features: Record<TrainerPlanFeatureKey, boolean>;
};

const PLAN_ORDER: TrainerPlanId[] = ["free", "pro", "ai_pro"];

export const TRAINER_PLANS: Record<TrainerPlanId, TrainerPlanDefinition> = {
  free: {
    id: "free",
    name: "Free",
    priceLabel: "$0",
    blurb: "For solo coaches getting started.",
    maxClients: 20,
    features: {
      basicCalendar: true,
      advancedCalendar: false,
      emailReminders: true,
      smsReminders: false,
      analytics: false,
      aiAssistant: false,
      aiScheduling: false,
      aiMealPlans: false,
      prioritySupport: false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceLabel: "$29/mo",
    blurb: "Everything you need to run a serious practice.",
    maxClients: null,
    features: {
      basicCalendar: true,
      advancedCalendar: true,
      emailReminders: true,
      smsReminders: true,
      analytics: true,
      aiAssistant: true,
      aiScheduling: true,
      aiMealPlans: false,
      prioritySupport: false,
    },
  },
  ai_pro: {
    id: "ai_pro",
    name: "AI Pro",
    priceLabel: "$59/mo",
    blurb: "AI workflows that save hours every week.",
    maxClients: null,
    features: {
      basicCalendar: true,
      advancedCalendar: true,
      emailReminders: true,
      smsReminders: true,
      analytics: true,
      aiAssistant: true,
      aiScheduling: true,
      aiMealPlans: true,
      prioritySupport: true,
    },
  },
};

export const TRAINER_NAV_GATES: Record<
  string,
  { minPlan: TrainerPlanId; badge: string }
> = {
  "/analytics": { minPlan: "pro", badge: "Pro" },
  "/ai": { minPlan: "pro", badge: "Pro" },
};

export function planRank(plan: TrainerPlanId): number {
  return PLAN_ORDER.indexOf(plan);
}

export function planMeetsMinimum(
  current: TrainerPlanId,
  required: TrainerPlanId,
): boolean {
  return planRank(current) >= planRank(required);
}

export function hasTrainerFeature(
  plan: TrainerPlanId,
  feature: TrainerPlanFeatureKey,
): boolean {
  return TRAINER_PLANS[plan].features[feature];
}

export function requiredPlanLabel(required: TrainerPlanId): string {
  return TRAINER_PLANS[required].name;
}

export function upgradePlanForFeature(feature: TrainerPlanFeatureKey): TrainerPlanId {
  if (
    feature === "aiAssistant" ||
    feature === "aiScheduling" ||
    feature === "aiMealPlans"
  ) {
    return "ai_pro";
  }
  if (
    feature === "analytics" ||
    feature === "advancedCalendar" ||
    feature === "smsReminders"
  ) {
    return "pro";
  }
  return "free";
}

export function prismaPlanToApp(
  plan: "FREE" | "PRO" | "AI_PRO",
): TrainerPlanId {
  switch (plan) {
    case "PRO":
      return "pro";
    case "AI_PRO":
      return "ai_pro";
    default:
      return "free";
  }
}

export function appPlanToPrisma(plan: TrainerPlanId): "FREE" | "PRO" | "AI_PRO" {
  switch (plan) {
    case "pro":
      return "PRO";
    case "ai_pro":
      return "AI_PRO";
    default:
      return "FREE";
  }
}
