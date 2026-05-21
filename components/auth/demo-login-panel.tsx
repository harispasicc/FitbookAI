"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_CLIENT, DEMO_TRAINER } from "@/lib/demo-accounts";
import {
  CLIENT_DEMO_LOGIN_PATH,
  TRAINER_DEMO_LOGIN_PATH,
} from "@/lib/site-nav";
import { cn } from "@/lib/utils";

type DemoLoginPanelProps = {
  variant: "client" | "trainer";
  onUseDemo: (email: string, password: string) => void;
  disabled?: boolean;
  defaultOpen?: boolean;
};

export function DemoLoginPanel({
  variant,
  onUseDemo,
  disabled = false,
  defaultOpen = false,
}: DemoLoginPanelProps) {
  const creds = variant === "trainer" ? DEMO_TRAINER : DEMO_CLIENT;
  const other =
    variant === "client"
      ? { href: TRAINER_DEMO_LOGIN_PATH, label: `Coach demo · ${DEMO_TRAINER.label}` }
      : { href: CLIENT_DEMO_LOGIN_PATH, label: `Client demo · ${DEMO_CLIENT.label}` };

  return (
    <details className="group rounded-lg border border-border/70 bg-muted/25 text-sm" open={defaultOpen || undefined}>
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium text-foreground",
          "[&::-webkit-details-marker]:hidden",
        )}
      >
        <span>Quick demo access</span>
        <ChevronDown
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        />
      </summary>

      <div className="space-y-2.5 border-t border-border/60 px-3 pb-3 pt-2">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Demo mode with pre-seeded accounts. Explore the app instantly with
          pre-configured client and coach profiles.
        </p>

        <p className="text-[11px] leading-snug text-muted-foreground">
          <span className="text-foreground/80">{creds.email}</span>
          <span className="mx-1.5 text-border">·</span>
          <span className="text-foreground/80">{creds.password}</span>
        </p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 w-full border-primary/25 bg-background hover:bg-primary/5"
          disabled={disabled}
          onClick={() => onUseDemo(creds.email, creds.password)}
        >
          Sign in as {creds.label}
        </Button>

        <p className="text-center text-[11px] text-muted-foreground">
          <Link
            href={other.href}
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            {other.label}
          </Link>
        </p>
      </div>
    </details>
  );
}
