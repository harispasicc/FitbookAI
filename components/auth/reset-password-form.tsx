"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiResetPassword } from "@/lib/auth-api";
import { BusyDots } from "@/components/ui/busy-dots";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ResetPasswordFormProps = {
  token: string;
  variant?: "client" | "trainer";
};

export function ResetPasswordForm({ token, variant = "client" }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const loginHref = variant === "trainer" ? "/trainer/login" : "/login";
  const forgotHref =
    variant === "trainer" ? "/forgot-password?portal=trainer" : "/forgot-password";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const result = await apiResetPassword({ token, password });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setDone(true);
    window.setTimeout(() => {
      router.push(loginHref);
    }, 2000);
  }

  if (!token.trim()) {
    return (
      <div className="space-y-4 text-sm">
        <p className="text-destructive">This reset link is missing a token.</p>
        <Link href={forgotHref} className="font-medium text-primary underline-offset-4 hover:underline">
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-3 rounded-lg border border-primary/25 bg-primary/5 px-3 py-3 text-sm">
        <p className="font-medium text-foreground">Password updated</p>
        <p className="text-muted-foreground">Taking you to sign in…</p>
        <Link href={loginHref} className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in now
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
          {error.includes("expired") || error.includes("invalid") ? (
            <p className="mt-2">
              <Link href={forgotHref} className="font-medium underline underline-offset-2">
                Request a new link
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm password</Label>
        <Input
          id="confirm-password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          minLength={8}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? <BusyDots size="sm" className="[&_span]:bg-primary-foreground/90" /> : "Update password"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href={loginHref} className="font-medium text-primary underline-offset-4 hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </form>
  );
}
