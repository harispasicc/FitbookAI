"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  hasTrainerFeature,
  planMeetsMinimum,
  type TrainerPlanFeatureKey,
  type TrainerPlanId,
} from "@/lib/trainer-plans";
import {
  apiGetTrainerPlan,
  type TrainerPlanContextDto,
} from "@/lib/trainer-portal-api";
import { BOOKINGS_UPDATE_EVENT } from "@/lib/demo-data-events";
import { deferEffect } from "@/lib/defer-effect";

export function useTrainerPlan() {
  const { user, isHydrated } = useAuth();
  const [planContext, setPlanContext] = useState<TrainerPlanContextDto | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user || user.role !== "trainer") {
      setPlanContext(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiGetTrainerPlan();
      setPlanContext(data);
    } catch (e) {
      setPlanContext(null);
      setError(e instanceof Error ? e.message : "Failed to load plan");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isHydrated) return;
    deferEffect(() => void refresh());
  }, [isHydrated, refresh]);

  useEffect(() => {
    function onUpdate() {
      void refresh();
    }
    window.addEventListener(BOOKINGS_UPDATE_EVENT, onUpdate);
    return () => window.removeEventListener(BOOKINGS_UPDATE_EVENT, onUpdate);
  }, [refresh]);

  const plan: TrainerPlanId = planContext?.plan ?? "free";

  function canAccessFeature(feature: TrainerPlanFeatureKey) {
    return hasTrainerFeature(plan, feature);
  }

  function canAccessRoute(href: string) {
    if (href === "/analytics") return planMeetsMinimum(plan, "pro");
    if (href === "/ai") return planMeetsMinimum(plan, "ai_pro");
    return true;
  }

  function meetsPlan(required: TrainerPlanId) {
    return planMeetsMinimum(plan, required);
  }

  return {
    planContext,
    plan,
    loading,
    error,
    refresh,
    canAccessFeature,
    canAccessRoute,
    meetsPlan,
  };
}
