import type { Metadata } from "next";
import { AnalyticsView } from "@/components/dashboard/analytics-view";
import { PlanGate } from "@/components/dashboard/plan-gate";

export const metadata: Metadata = {
  title: "Analytics",
};

export default function AnalyticsPage() {
  return (
    <PlanGate
      minPlan="pro"
      feature="analytics"
      title="Analytics requires Pro"
      description="Revenue, retention, and booking trends are available on Pro and AI Pro."
    >
      <AnalyticsView />
    </PlanGate>
  );
}
