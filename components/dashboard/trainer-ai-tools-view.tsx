"use client";
import { motion } from "framer-motion";
import { Bot, ClipboardList, Dumbbell, MessageCircle, RefreshCw, Salad, Sparkles, TrendingUp, Users, } from "lucide-react";
import { AiHeroPanel } from "@/components/visual/ai-hero-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
const tools = [
    {
        icon: Dumbbell,
        title: "Generate workout plan",
        desc: "Block periodization from goals, equipment, and days per week.",
        placeholder: "Client: Alex · 3× strength · knee-friendly squat pattern…",
    },
    {
        icon: MessageCircle,
        title: "Generate reminder message",
        desc: "Tone-matched SMS or email nudges before sessions.",
        placeholder: "Friendly reminder for tomorrow 6pm lower-body session…",
    },
    {
        icon: ClipboardList,
        title: "Summarize client progress",
        desc: "Turn last 30 days of notes + attendance into a coach brief.",
        placeholder: "Paste recent session notes or bullet milestones…",
    },
    {
        icon: RefreshCw,
        title: "Suggest re-engagement message",
        desc: "Win back paused clients without sounding salesy.",
        placeholder: "Client paused 3 weeks ago after travel block…",
    },
    {
        icon: Salad,
        title: "Generate nutrition tips",
        desc: "High-protein meal ideas aligned to training phase.",
        placeholder: "Fat-loss phase · dairy-light · 190g protein target…",
    },
    {
        icon: Users,
        title: "AI client insights",
        desc: "Risk flags: attendance drops, plateauing loads, HRV mentions.",
        placeholder: "Import CSV of attendance + RPE (coming soon)…",
    },
] as const;
export function TrainerAiToolsView() {
    return (<div className="min-w-0 space-y-6 sm:space-y-8">
      <div className="min-w-0 space-y-1">
        <h1 className="text-balance text-xl font-semibold tracking-tight text-foreground min-[400px]:text-2xl">
          AI workspace
        </h1>
        <p className="text-sm text-muted-foreground">
          Fitness and business copilots — structured prompts instead of a blank chat box. Connect your AI model to
          these templates.
        </p>
      </div>

      <AiHeroPanel className="min-w-0"/>

      <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tools.map((t, i) => (<motion.div key={t.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -2 }}>
            <Card className="h-full rounded-2xl border border-border/80 bg-card/90 shadow-sm backdrop-blur-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                  <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted/40 text-primary">
                    <t.icon className="size-4" aria-hidden/>
                  </span>
                  {t.title}
                </CardTitle>
                <CardDescription>{t.desc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <textarea readOnly placeholder={t.placeholder} className={cn("flex min-h-[88px] w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50")}/>
                <Button type="button" size="sm" className="w-full rounded-xl" disabled>
                  Generate (connect when live)
                </Button>
              </CardContent>
            </Card>
          </motion.div>))}
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border border-border/80 bg-card/90 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="size-4 text-muted-foreground" aria-hidden/>
              AI assistant chat
            </CardTitle>
            <CardDescription>Optional free-form layer on top of the tools above.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
              <p className="text-xs font-medium text-muted-foreground">You</p>
              <p>Draft a 4-week return-to-run plan for a client coming off shin splints.</p>
            </div>
            <div className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">FitBook AI</p>
              <p>
                Start with <span className="font-medium">2–3 easy sessions / week</span>, cap intensity below RPE 6, and
                progress volume by ≤10% weekly…
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 shrink-0" aria-hidden/>
              Preview — streaming replies when your workspace is connected.
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-border/80 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-primary" aria-hidden/>
              Templates
            </CardTitle>
            <CardDescription>One-tap starters you can map to server actions.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {["Post-deload summary", "Trial follow-up", "Macro-friendly grocery list", "Weekend accountability text"].map((label) => (<Button key={label} variant="outline" className="h-auto justify-start rounded-xl py-2.5 text-left text-sm font-normal" type="button" disabled>
                  {label}
                </Button>))}
          </CardContent>
        </Card>
      </div>
    </div>);
}
