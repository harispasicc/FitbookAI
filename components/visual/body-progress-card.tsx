import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
export function BodyProgressCard({ className }: {
    className?: string;
}) {
    return (<Card className={cn("overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-orange-50/30 shadow-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Client progress</CardTitle>
        <CardDescription>12-week cut (illustrative progress)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">Body fat trend</span>
            <span className="tabular-nums text-muted-foreground">22% → 16%</span>
          </div>
          <div className="relative h-2.5 overflow-hidden rounded-full bg-muted">
            <div className="absolute inset-y-0 left-0 w-[72%] rounded-full bg-gradient-to-r from-teal-500 to-orange-400"/>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">Training adherence</span>
            <span className="tabular-nums text-muted-foreground">18 / 20 sessions</span>
          </div>
          <div className="relative h-2.5 overflow-hidden rounded-full bg-muted">
            <div className="absolute inset-y-0 left-0 w-[90%] rounded-full bg-gradient-to-r from-orange-400 to-teal-500"/>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Weekly check-ins logged · Consistency score <span className="font-medium text-foreground">91%</span>
        </p>
      </CardContent>
    </Card>);
}
