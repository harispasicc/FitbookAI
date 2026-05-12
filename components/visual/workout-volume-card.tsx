import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyBarsChart } from "@/components/visual/fitness-charts";
import { cn } from "@/lib/utils";
export function WorkoutVolumeCard({ className }: {
    className?: string;
}) {
    const vol = [42, 55, 38, 62, 48, 28, 35];
    return (<Card className={cn("rounded-2xl border border-border/80 bg-card/80 shadow-sm backdrop-blur-sm", className)}>
      <CardHeader className="pb-0">
        <CardTitle className="text-base">Weekly load</CardTitle>
        <CardDescription>Session minutes · last 7 days (sample)</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-32 rounded-xl border border-border/60 bg-muted/20 p-2">
          <WeeklyBarsChart values={vol} barClassName="fill-teal-500/75"/>
        </div>
      </CardContent>
    </Card>);
}
