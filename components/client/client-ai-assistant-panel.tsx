"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, Sparkles } from "lucide-react";
import { getStubClientAiReply } from "@/lib/client-ai-stub";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
type Role = "user" | "assistant";
export type ClientChatMessage = {
    id: string;
    role: Role;
    content: string;
};
const STARTER_ASSISTANT = "Hi — I’m **FitBook AI**. I can help with **sessions**, **goals**, and **booking**. Try a suggested prompt below.";
const PROMPTS_DEFAULT = [
    "When is my next session?",
    "How do I book a new slot?",
    "What should I focus on this week?",
];
const PROMPTS_COMPACT = ["Next session?", "How do I book?", "Explain my goal progress"];
type ClientAiAssistantPanelProps = {
    variant?: "default" | "compact";
    className?: string;
};
export function ClientAiAssistantPanel({ variant = "default", className }: ClientAiAssistantPanelProps) {
    const compact = variant === "compact";
    const [messages, setMessages] = useState<ClientChatMessage[]>([
        { id: "m0", role: "assistant", content: STARTER_ASSISTANT },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);
    const send = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || loading)
            return;
        const userMsg: ClientChatMessage = { id: `u-${Date.now()}`, role: "user", content: trimmed };
        setMessages((m) => [...m, userMsg]);
        setInput("");
        setLoading(true);
        try {
            const reply = await getStubClientAiReply(trimmed);
            setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "assistant", content: reply }]);
        }
        finally {
            setLoading(false);
        }
    }, [loading]);
    const prompts = compact ? PROMPTS_COMPACT : PROMPTS_DEFAULT;
    return (<Card className={cn("overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm", compact ? "border-primary/15" : "border-primary/20 shadow-md shadow-primary/5", className)}>
      <CardHeader className={cn("border-b border-border/60 bg-muted/20", compact ? "py-3" : "py-4")}>
        <CardTitle className={cn("flex items-center gap-2", compact ? "text-sm" : "text-base")}>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-4" aria-hidden/>
          </span>
          FitBook AI
        </CardTitle>
        <CardDescription className={cn(compact && "text-xs")}>
          Booking hints, progress nudges, and questions about your plan — powered by FitBook AI.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact ? "p-3 pt-3" : "p-4 pt-4")}>
        <div className={cn("space-y-3 overflow-y-auto rounded-xl border border-border/60 bg-muted/15 p-3", compact ? "max-h-52" : "max-h-80")} role="log" aria-live="polite" aria-relevant="additions">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (<motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm", msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "border border-border/80 bg-card text-foreground")}>
                  {msg.role === "assistant" ? (<p className="whitespace-pre-wrap [&_strong]:font-semibold">{formatAssistantMarkdown(msg.content)}</p>) : (<p className="whitespace-pre-wrap">{msg.content}</p>)}
                </div>
              </motion.div>))}
          </AnimatePresence>
          {loading ? (<div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-card px-3 py-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" aria-hidden/>
                Thinking…
              </div>
            </div>) : null}
          <div ref={endRef}/>
        </div>

        <div className="flex flex-wrap gap-2">
          {prompts.map((p) => (<Button key={p} type="button" variant="outline" size="sm" className="h-8 rounded-full border-border/80 text-xs font-normal" disabled={loading} onClick={() => void send(p)}>
              {p}
            </Button>))}
        </div>

        <div className="flex gap-2">
          <label htmlFor="client-ai-input" className="sr-only">
            Message to FitBook AI
          </label>
          <textarea id="client-ai-input" rows={compact ? 2 : 2} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
            }
        }} placeholder="Ask FitBook AI about sessions, goals, or booking…" disabled={loading} className="min-h-10 flex-1 resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"/>
          <Button type="button" size="icon" className="size-10 shrink-0 rounded-xl" disabled={loading || !input.trim()} aria-label="Send message" onClick={() => void send(input)}>
            {loading ? <Loader2 className="size-4 animate-spin"/> : <Send className="size-4"/>}
          </Button>
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          FitBook AI can be wrong about health or scheduling — your coach has the final word. Do not use this as a
          substitute for medical advice.
        </p>
      </CardContent>
    </Card>);
}
function formatAssistantMarkdown(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        const m = part.match(/^\*\*([^*]+)\*\*$/);
        if (m) {
            return (<strong key={i} className="font-semibold">
          {m[1]}
        </strong>);
        }
        return <span key={i}>{part}</span>;
    });
}
