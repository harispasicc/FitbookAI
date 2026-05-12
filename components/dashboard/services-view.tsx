"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDemoData } from "@/hooks/use-demo-data";
import { fitnessImages } from "@/lib/media-urls";
import { readDemoState, writeDemoState } from "@/lib/demo-storage";
import { cn } from "@/lib/utils";
const serviceHero = [fitnessImages.dumbbells, fitnessImages.stretch, fitnessImages.track] as const;
export function ServicesView() {
    const { data, refresh } = useDemoData();
    const services = data?.services ?? [];
    function toggleActive(id: string) {
        const cur = readDemoState();
        if (!cur)
            return;
        writeDemoState({
            ...cur,
            services: cur.services.map((s) => (s.id === id ? { ...s, active: !s.active } : s)),
        });
        refresh();
    }
    return (<div className="min-w-0 space-y-6 sm:space-y-8">
      <div className="min-w-0 space-y-1">
        <h1 className="text-balance text-xl font-semibold tracking-tight min-[400px]:text-2xl">Services</h1>
        <p className="text-sm text-muted-foreground">
          1-on-1, group, and online offerings — price, duration, capacity, and visibility toggles.
        </p>
      </div>
      {services.length === 0 ? (<Card className="rounded-2xl border border-border/80 bg-muted/20 shadow-sm">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Sign up to load sample services.
          </CardContent>
        </Card>) : (<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((s, i) => (<motion.div key={s.id} whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
              <Card className="overflow-hidden rounded-2xl border border-border/80 bg-card/90 shadow-sm backdrop-blur-sm">
                <div className="relative aspect-[21/9] w-full">
                  <Image src={serviceHero[i % serviceHero.length]} alt="" fill className={cn("object-cover transition-opacity", !s.active && "opacity-40")} sizes="(max-width: 768px) 100vw, 33vw"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent"/>
                  <span className={cn("absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1", s.active ? "bg-emerald-500/90 text-white ring-emerald-600/40" : "bg-background/90 text-muted-foreground ring-border")}>
                    {s.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <CardHeader className="space-y-1">
                  <CardTitle className="text-base">{s.name}</CardTitle>
                  <CardDescription>{s.mode}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p className="text-pretty leading-relaxed">{s.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border/60 pt-3 text-xs">
                    <span>
                      <span className="font-medium text-foreground">{s.durationMin} min</span> duration
                    </span>
                    <span>
                      <span className="font-medium text-foreground">${s.priceUsd}</span> price
                    </span>
                    <span>
                      Max <span className="font-medium text-foreground">{s.maxParticipants}</span> participants
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <p className="text-xs text-muted-foreground">Clients only see active services in booking.</p>
                    <Button type="button" size="sm" variant="outline" className="shrink-0" onClick={() => toggleActive(s.id)}>
                      {s.active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>))}
        </div>)}
    </div>);
}
