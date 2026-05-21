"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Crown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BusyDots } from "@/components/ui/busy-dots";
import { useTrainerPlan } from "@/hooks/use-trainer-plan";
import {
  apiPatchTrainerPlan,
  type TrainerPlanContextDto,
} from "@/lib/trainer-portal-api";
import { TRAINER_PLANS, type TrainerPlanId } from "@/lib/trainer-plans";
import { cn } from "@/lib/utils";

const PLAN_OPTIONS: TrainerPlanId[] = ["free", "pro", "ai_pro"];

export function TrainerPlanSettingsCard() {
  const { planContext, loading, refresh } = useTrainerPlan();
  const [saving, setSaving] = useState<TrainerPlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function selectPlan(next: TrainerPlanId) {
    if (!planContext || planContext.plan === next) return;
    setSaving(next);
    setError(null);
    try {
      await apiPatchTrainerPlan(next);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update plan");
    } finally {
      setSaving(null);
    }
  }

  if (loading && !planContext) {
    return (
      <Card className="rounded-2xl border border-border/80 lg:col-span-2">
        <CardContent className="flex justify-center py-10">
          <BusyDots />
        </CardContent>
      </Card>
    );
  }

  const ctx = planContext as TrainerPlanContextDto | null;
  if (!ctx) return null;

  return (
    <Card className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-primary/[0.03] shadow-sm lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Crown className="size-4 text-primary" aria-hidden />
          Your plan
        </CardTitle>
        <CardDescription>
          Current: <span className="font-medium text-foreground">{ctx.planName}</span> (
          {ctx.priceLabel})
          {ctx.maxClients !== null
            ? ` · ${ctx.clientCount}/${ctx.maxClients} clients`
            : ` · ${ctx.clientCount} clients`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {PLAN_OPTIONS.map((id) => {
            const tier = TRAINER_PLANS[id];
            const active = ctx.plan === id;
            return (
              <button
                key={id}
                type="button"
                disabled={saving !== null}
                onClick={() => void selectPlan(id)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border/80 bg-background hover:border-primary/30",
                )}
              >
                <p className="font-semibold text-foreground">{tier.name}</p>
                <p className="text-sm text-muted-foreground">{tier.priceLabel}</p>
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {id === "free" ? (
                    <>
                      <li>Up to 20 clients</li>
                      <li>Basic calendar</li>
                    </>
                  ) : id === "pro" ? (
                    <>
                      <li>Unlimited clients</li>
                      <li>Analytics + week view</li>
                    </>
                  ) : (
                    <>
                      <li>Everything in Pro</li>
                      <li>AI Assistant</li>
                    </>
                  )}
                </ul>
                {active ? (
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                    <Check className="size-3.5" aria-hidden />
                    Active
                  </span>
                ) : saving === id ? (
                  <span className="mt-3 inline-block text-xs text-muted-foreground">Saving…</span>
                ) : null}
              </button>
            );
          })}
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <p className="text-xs text-muted-foreground">
          Demo: switch plans here without billing. Production would use Stripe.{" "}
          <Link href="/coach/pricing" className="font-medium text-primary underline-offset-2 hover:underline">
            Compare plans
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
