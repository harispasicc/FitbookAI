"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Dumbbell, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import {
  apiTrainerTool,
  TRAINER_TOOL_LABELS,
  type TrainerToolType,
} from "@/lib/ai-api";
import { AiHeroPanel } from "@/components/visual/ai-hero-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const tools: {
  tool: TrainerToolType;
  icon: typeof Dumbbell;
  placeholder: string;
}[] = [
  {
    tool: "generate_workout",
    icon: Dumbbell,
    placeholder: "Client: Alex · 3× strength · knee-friendly squat pattern…",
  },
  {
    tool: "generate_reminder",
    icon: MessageCircle,
    placeholder: "Friendly reminder for tomorrow 6pm lower-body session…",
  },
  {
    tool: "summarize_progress",
    icon: ClipboardList,
    placeholder: "Paste recent session notes or bullet milestones…",
  },
  {
    tool: "reengagement_message",
    icon: RefreshCw,
    placeholder: "Client paused 3 weeks ago after travel block…",
  },
];

export function TrainerAiToolsView() {
  return (
    <motion.div className="min-w-0 space-y-6 sm:space-y-8">
      <div className="min-w-0 space-y-1">
        <h1 className="text-balance text-xl font-semibold tracking-tight text-foreground min-[400px]:text-2xl">
          AI workspace
        </h1>
        <p className="text-sm text-muted-foreground">
          Fitness copilots with structured prompts — each tool calls your server-side AI with live workspace context.
        </p>
      </div>

      <AiHeroPanel className="min-w-0" />

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        {tools.map((t, i) => (
          <TrainerToolCard key={t.tool} tool={t.tool} icon={t.icon} placeholder={t.placeholder} index={i} />
        ))}
      </div>
    </motion.div>
  );
}

function TrainerToolCard({
  tool,
  icon: Icon,
  placeholder,
  index,
}: {
  tool: TrainerToolType;
  icon: typeof Dumbbell;
  placeholder: string;
  index: number;
}) {
  const meta = TRAINER_TOOL_LABELS[tool];
  const [clientName, setClientName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [source, setSource] = useState<"openai" | "fallback" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setOutput(null);
    setSource(null);

    const result = await apiTrainerTool({
      tool,
      prompt: trimmed,
      clientName: clientName.trim() || undefined,
    });

    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setOutput(result.data.reply);
    setSource(result.data.source);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
    >
      <Card className="h-full rounded-2xl border border-border/80 bg-card/90 shadow-sm backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base text-foreground">
            <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-muted/40 text-primary">
              <Icon className="size-4" aria-hidden />
            </span>
            {meta.title}
          </CardTitle>
          <CardDescription>{meta.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Client name (optional)"
            disabled={loading}
            className="rounded-xl"
          />
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            className={cn(
              "flex min-h-[88px] w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            )}
          />
          <Button
            type="button"
            size="sm"
            className="w-full rounded-xl"
            disabled={loading || !prompt.trim()}
            onClick={() => void generate()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Generating…
              </>
            ) : (
              "Generate"
            )}
          </Button>

          {error ? (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          {output ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2 rounded-xl border border-border bg-muted/30 p-3 text-sm leading-relaxed"
            >
              <p className="whitespace-pre-wrap text-foreground">{output}</p>
              {source ? (
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Source: {source === "openai" ? "OpenAI" : "offline preview"}
                </p>
              ) : null}
            </motion.div>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
