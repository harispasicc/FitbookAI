import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { WeeklyBarsChart } from "@/components/visual/fitness-charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fitnessImages } from "@/lib/media-urls";
export function CalendarPlaceholder() {
    const weekLoad = [32, 44, 40, 52, 48, 36, 28];
    return (<Card className="overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex size-8 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground">
            <CalendarDays className="size-4" aria-hidden/>
          </span>
          Calendar
        </CardTitle>
        <CardDescription>Weekly / daily views, drag-and-drop, and approvals ship here.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative min-h-[260px]">
          <Image src={fitnessImages.gymFloor} alt="" fill className="object-cover opacity-[0.35]" sizes="100vw"/>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40"/>
          <div className="relative flex min-h-[260px] flex-col justify-end gap-4 p-6">
            <div className="rounded-2xl border border-border/80 bg-background/85 p-4 shadow-lg shadow-black/10 backdrop-blur-md">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Booking intensity · this week</p>
              <div className="h-28">
                <WeeklyBarsChart values={weekLoad} barClassName="fill-teal-500/80"/>
              </div>
            </div>
            <p className="max-w-lg text-sm text-muted-foreground">
              Wire Google Calendar, Cal.com, or your own scheduler — this canvas is ready for real availability
              layers.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>);
}
