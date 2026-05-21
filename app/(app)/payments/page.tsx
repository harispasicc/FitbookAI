import type { Metadata } from "next";
import { CreditCard, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
export const metadata: Metadata = {
    title: "Payments",
};
export default function PaymentsPage() {
    return (<div className="min-w-0 space-y-6 sm:space-y-8">
      <div className="min-w-0 space-y-1">
        <h1 className="text-balance text-xl font-semibold tracking-tight min-[400px]:text-2xl">Payments</h1>
        <p className="text-sm text-muted-foreground">
          Invoices, subscriptions, and payout summaries will live here. Stripe integration coming soon.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl border border-border/80 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="size-4 text-muted-foreground" aria-hidden/>
              Client billing
            </CardTitle>
            <CardDescription>Per-session charges and packages.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>No processor connected in this demo build.</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-border/80 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4 text-muted-foreground" aria-hidden/>
              Payouts & tax
            </CardTitle>
            <CardDescription>Exports for your accountant.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>CSV and PDF export placeholders.</p>
          </CardContent>
        </Card>
      </div>
    </div>);
}
