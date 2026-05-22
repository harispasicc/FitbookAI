"use client";

import Link from "next/link";
import { useState } from "react";
import { apiForgotPassword } from "@/lib/auth-api";
import { BusyDots } from "@/components/ui/busy-dots";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ForgotPasswordFormProps = {
  variant?: "client" | "trainer";
};

export function ForgotPasswordForm({ variant = "client" }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loginHref = variant === "trainer" ? "/trainer/login" : "/login";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    setDevResetUrl(null);

    const result = await apiForgotPassword({ email });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setMessage(result.message);
    if (result.devResetUrl) {
      setDevResetUrl(result.devResetUrl);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="space-y-3 rounded-lg border border-primary/25 bg-primary/5 px-3 py-3 text-sm">
          <p className="text-foreground">{message}</p>
          {devResetUrl ? (
            <div className="space-y-2 border-t border-primary/15 pt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Development only
              </p>
              <p className="break-all text-xs text-muted-foreground">{devResetUrl}</p>
              <Button type="button" variant="outline" size="sm" className="w-full" asChild>
                <Link href={devResetUrl}>Open reset link</Link>
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Enter your account email. We will send a link to reset your password if an account exists.
          </p>
          <div className="space-y-2">
            <Label htmlFor="forgot-email">Email</Label>
            <Input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <BusyDots size="sm" className="[&_span]:bg-primary-foreground/90" /> : "Send reset link"}
          </Button>
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        <Link href={loginHref} className="font-medium text-primary underline-offset-4 hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </form>
  );
}
