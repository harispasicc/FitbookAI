"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export type LoginFormProps = {
    trainerId?: string;
    variant?: "client" | "trainer";
};
export function LoginForm({ trainerId, variant = "client" }: LoginFormProps) {
    const router = useRouter();
    const { user, isHydrated, login, logout } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [portalError, setPortalError] = useState<string | null>(null);
    const isTrainerPortal = variant === "trainer";
    const signupHref = isTrainerPortal
        ? "/signup?intent=trainer"
        : trainerId
            ? `/signup?trainer=${encodeURIComponent(trainerId)}`
            : "/signup";
    const otherLoginHref = isTrainerPortal ? "/login" : "/trainer/login";
    const otherLoginLabel = isTrainerPortal ? "Client sign in" : "Coach sign in";
    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setPortalError(null);
        const result = login(email, password, {
            selectedTrainerId: !isTrainerPortal && trainerId ? trainerId : undefined,
            expectedRole: isTrainerPortal ? "trainer" : "client",
        });
        if (!result.ok) {
            if (result.reason === "role_mismatch") {
                setPortalError(result.existingRole === "trainer"
                    ? "This email is already a coach account. Use coach sign in instead."
                    : "This email is a client account. Use client sign in instead.");
            }
            return;
        }
        router.push(result.user.role === "trainer" ? "/dashboard" : "/me");
    }
    if (!isHydrated) {
        return (<div className="space-y-4">
        <div className="h-9 animate-pulse rounded-md bg-muted"/>
        <div className="h-9 animate-pulse rounded-md bg-muted"/>
        <div className="h-9 animate-pulse rounded-md bg-muted"/>
      </div>);
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
                logout();
                router.replace("/");
            }}>
            Sign out
          </Button>
          <Button type="button" className="flex-1" asChild>
            <Link href={user.role === "trainer" ? "/dashboard" : "/me"}>Continue to app</Link>
          </Button>
        </div>
      </div>);
    }
    return (<form className="space-y-4" onSubmit={onSubmit}>
      {portalError ? (<div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {portalError}{" "}
          <Link href={otherLoginHref} className="font-medium underline underline-offset-2">
            {otherLoginLabel}
          </Link>
        </div>) : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(e) => {
            setEmail(e.target.value);
            setPortalError(null);
        }} required/>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required/>
        <p className="text-xs text-muted-foreground">
          Password is not verified — prototype sign-in. Nothing is sent to a server.
        </p>
      </div>
      <Button type="submit" className="w-full">
        {isTrainerPortal ? "Coach sign in" : "Client sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href={signupHref} className="font-medium text-primary underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        {isTrainerPortal ? "Looking to book a coach?" : "Are you a coach?"}{" "}
        <Link href={otherLoginHref} className="font-medium text-primary underline-offset-4 hover:underline">
          {otherLoginLabel}
        </Link>
      </p>
    </form>);
}
