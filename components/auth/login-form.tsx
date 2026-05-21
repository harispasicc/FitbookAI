"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { DemoLoginPanel } from "@/components/auth/demo-login-panel";
import {
  CLIENT_DEMO_LOGIN_PATH,
  CLIENT_LOGIN_PATH,
  TRAINER_DEMO_LOGIN_PATH,
  TRAINER_LOGIN_PATH,
} from "@/lib/site-nav";
import { AuthTransitionScreen } from "@/components/auth/auth-transition-screen";
import { Button } from "@/components/ui/button";
import { BusyDots } from "@/components/ui/busy-dots";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export type LoginFormProps = {
    trainerId?: string;
    variant?: "client" | "trainer";
    sessionExpired?: boolean;
    demoMode?: boolean;
};
export function LoginForm({
    trainerId,
    variant = "client",
    sessionExpired = false,
    demoMode = false,
}: LoginFormProps) {
    const router = useRouter();
    const { user, isHydrated, login, logout } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [portalError, setPortalError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{
        email?: string;
        password?: string;
    }>({});
    const [submitting, setSubmitting] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    function validateFields(emailVal: string, passwordVal: string) {
        const next: { email?: string; password?: string } = {};
        const trimmed = emailVal.trim();
        if (!trimmed) {
            next.email = "Enter your email address.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            next.email = "Enter a valid email address.";
        }
        if (!passwordVal) {
            next.password = "Enter your password.";
        } else if (passwordVal.length < 8) {
            next.password = "Password must be at least 8 characters.";
        }
        setFieldErrors(next);
        return Object.keys(next).length === 0;
    }
    const isTrainerPortal = variant === "trainer";
    const signupHref = isTrainerPortal
        ? "/signup?intent=trainer"
        : trainerId
            ? `/signup?trainer=${encodeURIComponent(trainerId)}`
            : "/signup";
    const otherLoginHref = demoMode
        ? isTrainerPortal
            ? CLIENT_DEMO_LOGIN_PATH
            : TRAINER_DEMO_LOGIN_PATH
        : isTrainerPortal
            ? CLIENT_LOGIN_PATH
            : TRAINER_LOGIN_PATH;
    const otherLoginLabel = demoMode
        ? isTrainerPortal
            ? `Client demo`
            : `Coach demo`
        : isTrainerPortal
            ? "Client sign in"
            : "Coach sign in";
    const regularLoginHref = isTrainerPortal ? TRAINER_LOGIN_PATH : CLIENT_LOGIN_PATH;
    async function performLogin(emailVal: string, passwordVal: string) {
        setPortalError(null);
        setSubmitting(true);
        let navigated = false;
        try {
            const result = await login(emailVal, passwordVal, {
                selectedTrainerId: !isTrainerPortal && trainerId ? trainerId : undefined,
                expectedRole: isTrainerPortal ? "trainer" : "client",
            });
            if (!result.ok) {
                if (result.reason === "role_mismatch") {
                    setPortalError(result.existingRole === "trainer"
                        ? "This email is already a coach account. Use coach sign in instead."
                        : "This email is a client account. Use client sign in instead.");
                } else {
                    setPortalError(result.message ?? "Invalid email or password.");
                }
                return;
            }
            navigated = true;
            setRedirecting(true);
            const dest = result.user.role === "trainer" ? "/dashboard" : "/me";
            await router.replace(dest);
        } finally {
            if (!navigated) {
                setSubmitting(false);
            }
        }
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validateFields(email, password)) {
            return;
        }
        await performLogin(email.trim(), password);
    }
    if (!isHydrated) {
        return (
          <AuthTransitionScreen label="Loading sign in" />
        );
    }
    if (submitting || redirecting) {
        return (
          <AuthTransitionScreen
            label={
              redirecting
                ? isTrainerPortal
                  ? "Opening coach workspace"
                  : "Opening your dashboard"
                : "Signing in"
            }
          />
        );
    }
    if (user) {
        return (<div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4 text-sm">
        <p className="text-foreground">
          You&apos;re signed in as <span className="font-medium">{user.email}</span>
          {user.role === "trainer" ? (<span className="text-muted-foreground"> (coach)</span>) : user.selectedTrainerId ? (<span className="text-muted-foreground"> (client · coach linked)</span>) : null}
          .
        </p>
        <p className="text-muted-foreground">
          Sign out if you want to enter a different email and password on this page.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" className="flex-1" onClick={() => {
                void logout().then(() => router.replace("/"));
            }}>
            Sign out
          </Button>
          <Button type="button" className="flex-1" asChild>
            <Link href={user.role === "trainer" ? "/dashboard" : "/me"}>Continue to app</Link>
          </Button>
        </div>
      </div>);
    }
    return (<form className="space-y-4" onSubmit={onSubmit} noValidate>
      {sessionExpired ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          You&apos;ve been signed out. Sign in again to continue.
        </div>
      ) : null}
      {portalError ? (<div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {portalError}{" "}
          <Link href={otherLoginHref} className="font-medium underline underline-offset-2">
            {otherLoginLabel}
          </Link>
        </div>) : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          aria-invalid={fieldErrors.email ? true : undefined}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          onChange={(e) => {
            setEmail(e.target.value);
            setPortalError(null);
            if (fieldErrors.email) {
              setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }
          }}
        />
        {fieldErrors.email ? (
          <p id="email-error" className="text-xs text-destructive" role="alert">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="password">Password</Label>
          <Link
            href={isTrainerPortal ? "/forgot-password?portal=trainer" : "/forgot-password"}
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          aria-invalid={fieldErrors.password ? true : undefined}
          aria-describedby={fieldErrors.password ? "password-error" : "password-hint"}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
        />
        {fieldErrors.password ? (
          <p id="password-error" className="text-xs text-destructive" role="alert">
            {fieldErrors.password}
          </p>
        ) : (
          <p id="password-hint" className="text-xs text-muted-foreground">
            Password must match your registered account (min. 8 characters).
          </p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={submitting || redirecting}>
        {submitting ? (
          <span className="inline-flex items-center justify-center gap-2">
            <BusyDots size="sm" className="[&_span]:bg-primary-foreground/90" />
            Signing in
          </span>
        ) : isTrainerPortal ? (
          "Coach sign in"
        ) : (
          "Client sign in"
        )}
      </Button>
      {demoMode ? (
        <p className="text-center text-sm text-muted-foreground">
          <Link href={regularLoginHref} className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in with your account
          </Link>
        </p>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href={signupHref} className="font-medium text-primary underline-offset-4 hover:underline">
            Create one
          </Link>
        </p>
      )}
      <p className="text-center text-sm text-muted-foreground">
        {demoMode
          ? isTrainerPortal
            ? "Explore as a client?"
            : "Explore as a coach?"
          : isTrainerPortal
            ? "Looking to book a coach?"
            : "Are you a coach?"}{" "}
        <Link href={otherLoginHref} className="font-medium text-primary underline-offset-4 hover:underline">
          {otherLoginLabel}
        </Link>
      </p>
      {demoMode ? (
        <DemoLoginPanel
          variant={isTrainerPortal ? "trainer" : "client"}
          defaultOpen
          disabled={submitting}
          onUseDemo={(demoEmail, demoPassword) => {
            setFieldErrors({});
            setPortalError(null);
            setEmail(demoEmail);
            setPassword(demoPassword);
            void performLogin(demoEmail, demoPassword);
          }}
        />
      ) : null}
    </form>);
}
