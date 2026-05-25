"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Send, Sparkles } from "lucide-react";
import { BusyDots } from "@/components/ui/busy-dots";
import { useAuth } from "@/contexts/auth-context";
import { apiClientAssistant, type AiChatMessage } from "@/lib/ai-api";
import {
  loadClientAiChat,
  saveClientAiChat,
} from "@/lib/client-ai-chat-storage";
import { AiDailyLimitBanner } from "@/components/client/ai-daily-limit-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUtcDateKey } from "@/lib/ai-constants";
import { deferEffect } from "@/lib/defer-effect";
import { clientCard } from "@/lib/client-surfaces";
import { dashMutedSm } from "@/lib/dashboard-typography";
import { cn } from "@/lib/utils";

const AI_HISTORY_MAX = 18;

function aiLimitStorageKey(userId: string) {
  return `fitbook-ai-daily-limit:${userId}`;
}

type Role = "user" | "assistant";

export type ClientChatMessage = {
  id: string;
  role: Role;
  content: string;
};

const STARTER_ASSISTANT =
  "Hi! I'm **FitBook AI**. I can help with **sessions**, **goals**, and **booking**. Try a suggested prompt below.";

const STARTER_MESSAGE: ClientChatMessage = {
  id: "m0",
  role: "assistant",
  content: STARTER_ASSISTANT,
};

const PROMPTS_DEFAULT = [
  "When is my next session?",
  "How do I book a new slot?",
  "Who would you suggest as my coach?",
];

const PROMPTS_COMPACT = ["Next session?", "How do I book?", "Explain my goal progress"];

type ClientAiAssistantPanelProps = {
  variant?: "default" | "compact";
  className?: string;
};

function getInitialMessages(userId: string): ClientChatMessage[] {
  return loadClientAiChat(userId) ?? [STARTER_MESSAGE];
}

type AiChatPanelBodyProps = {
  userId: string;
  variant: "default" | "compact";
  className?: string;
  persist?: boolean;
};

function AiChatPanelBody({
  userId,
  variant,
  className,
  persist = true,
}: AiChatPanelBodyProps) {
  const compact = variant === "compact";
  const [messages, setMessages] = useState(() =>
    persist ? getInitialMessages(userId) : [STARTER_MESSAGE],
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const persistMessages = useCallback(
    (next: ClientChatMessage[]) => {
      if (persist) {
        saveClientAiChat(userId, next);
      }
    },
    [persist, userId],
  );

  useEffect(() => {
    deferEffect(() => {
      try {
        const stored = sessionStorage.getItem(aiLimitStorageKey(userId));
        if (stored === getUtcDateKey()) {
          setDailyLimitReached(true);
        }
      } catch {}
    });
  }, [userId]);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) {
      return;
    }
    el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading || dailyLimitReached) {
        return;
      }

      const userMsg: ClientChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };

      let withUser: ClientChatMessage[] = [];
      setMessages((current) => {
        withUser = [...current, userMsg];
        persistMessages(withUser);
        return withUser;
      });

      setInput("");
      setLoading(true);
      setError(null);

      try {
        const history: AiChatMessage[] = withUser
          .filter((m) => m.id !== "m0")
          .map((m) => ({ role: m.role, content: m.content }))
          .slice(-AI_HISTORY_MAX);

        const result = await apiClientAssistant({ message: trimmed, history });

        if (!result.ok) {
          if (result.code === "AI_DAILY_LIMIT") {
            setDailyLimitReached(true);
            setError(null);
            try {
              sessionStorage.setItem(aiLimitStorageKey(userId), getUtcDateKey());
            } catch {}
            return;
          }
          setError(result.message);
          return;
        }

        const assistantMsg: ClientChatMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: result.data.reply,
        };

        setMessages((current) => {
          const withAssistant = [...current, assistantMsg];
          persistMessages(withAssistant);
          return withAssistant;
        });
      } finally {
        setLoading(false);
      }
    },
    [dailyLimitReached, loading, persistMessages, userId],
  );

  const prompts = compact ? PROMPTS_COMPACT : PROMPTS_DEFAULT;

  return (
    <Card
      className={cn(
        clientCard.panelAccent,
        "overflow-hidden",
        compact && "shadow-sm",
        className,
      )}
    >
      <CardHeader
        className={cn(
          "border-0 bg-gradient-to-r from-violet-500/[0.06] to-teal-500/[0.04]",
          compact ? "py-3" : "py-4",
        )}
      >
        <CardTitle
          className={cn("flex items-center gap-2 font-bold", compact ? "text-sm" : "text-base")}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/12 text-violet-700 shadow-sm">
            <Sparkles className="size-4" aria-hidden />
          </span>
          FitBook AI
        </CardTitle>
        <CardDescription className={cn(dashMutedSm, compact && "text-xs")}>
          Booking hints, progress nudges, and questions about your plan. Powered by FitBook AI.
        </CardDescription>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact ? "p-3 pt-3" : "p-4 pt-4")}>
        {dailyLimitReached ? (
          <AiDailyLimitBanner compact={compact} className="shrink-0" />
        ) : null}

        <div
          ref={chatScrollRef}
          className={cn(
            "space-y-3 overflow-y-auto rounded-xl border-0 bg-muted/25 p-3 shadow-inner",
            compact ? "max-h-52" : "max-h-80",
          )}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border-0 bg-white/90 text-foreground shadow-sm",
                  )}
                >
                  {msg.role === "assistant" ? (
                    <p className="whitespace-pre-wrap [&_strong]:font-semibold">
                      {formatAssistantMarkdown(msg.content)}
                    </p>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading ? (
            <div className="flex justify-start">
              <motion.div className="rounded-2xl border-0 bg-white/90 px-3 py-2 shadow-sm">
                <BusyDots size="sm" />
              </motion.div>
            </div>
          ) : null}
        </div>

        {error && !dailyLimitReached ? (
          <p
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs leading-relaxed text-destructive"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {prompts.map((p) => (
            <Button
              key={p}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-border/80 text-xs font-normal"
              disabled={loading || dailyLimitReached}
              onClick={() => void send(p)}
            >
              {p}
            </Button>
          ))}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <label htmlFor="client-ai-input" className="sr-only">
            Message to FitBook AI
          </label>
          <textarea
            id="client-ai-input"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                void send(input);
              }
            }}
            placeholder={
              dailyLimitReached
                ? "Daily AI limit reached. Try again tomorrow"
                : "Ask FitBook AI about sessions, goals, or booking…"
            }
            disabled={loading || dailyLimitReached}
            className="min-h-10 flex-1 resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          />
          <Button
            type="submit"
            size="icon"
            className="size-10 shrink-0 rounded-xl"
            disabled={loading || dailyLimitReached || !input.trim()}
            aria-label="Send message"
          >
            {loading ? <BusyDots size="sm" /> : <Send className="size-4" />}
          </Button>
        </form>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Up to <span className="font-medium text-foreground">10 AI messages per day</span>{" "}
          while signed in. Answers use your live FitBook data (bookings, goals, coaches).
          Not medical advice. Your coach has the final word.
        </p>
      </CardContent>
    </Card>
  );
}

export function ClientAiAssistantPanel({
  variant = "default",
  className,
}: ClientAiAssistantPanelProps) {
  const { user, isHydrated } = useAuth();
  const compact = variant === "compact";

  if (!isHydrated) {
    return (
      <Card
        className={cn(
          "flex min-h-32 items-center justify-center rounded-2xl border-0 bg-card shadow-sm",
          className,
        )}
      >
        <BusyDots size="lg" />
      </Card>
    );
  }

  if (!user || user.role !== "client") {
    return (
      <Card
        className={cn(
          clientCard.panelAccent,
          "overflow-hidden",
          className,
        )}
      >
        <CardHeader
          className={cn(
            "border-0 bg-gradient-to-r from-violet-500/[0.06] to-teal-500/[0.04]",
            compact ? "py-3" : "py-4",
          )}
        >
          <CardTitle className={cn("flex items-center gap-2 font-bold", compact ? "text-sm" : "text-base")}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/12 text-violet-700">
              <Sparkles className="size-4" aria-hidden />
            </span>
            FitBook AI
          </CardTitle>
          <CardDescription className={cn(compact && "text-xs")}>
            Sign in as a client to ask about sessions, goals, and booking.
          </CardDescription>
        </CardHeader>
        <CardContent className={cn(compact ? "p-3" : "p-4")}>
          <Button asChild className="w-full rounded-xl" size={compact ? "sm" : "default"}>
            <Link href="/login">
              <LogIn className="size-4" aria-hidden />
              Sign in
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <AiChatPanelBody
      key={user.id}
      userId={user.id}
      variant={compact ? "compact" : "default"}
      className={className}
    />
  );
}

function formatAssistantMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    if (m) {
      return (
        <strong key={i} className="font-semibold">
          {m[1]}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
