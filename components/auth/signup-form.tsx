"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export type SignupFormProps = {
    accountKind: "client" | "trainer";
    trainerId?: string;
};
export function SignupForm({ accountKind, trainerId }: SignupFormProps) {
    const router = useRouter();
    const { user, isHydrated, signup, logout } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const loginHref = accountKind === "trainer"
        ? "/trainer/login"
        : accountKind === "client" && trainerId
            ? `/login?trainer=${encodeURIComponent(trainerId)}`
            : "/login";
    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const next = signup(name, email, password, {
            role: accountKind === "trainer" ? "trainer" : "client",
            selectedTrainerId: accountKind === "client" && trainerId ? trainerId : undefined,
        });
        router.push(next.role === "trainer" ? "/dashboard" : "/me");
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
          {user.role === "trainer" ? (<span className="text-muted-foreground"> (coach workspace)</span>) : user.selectedTrainerId ? (<span className="text-muted-foreground"> (client · coach saved for demo)</span>) : (<span className="text-muted-foreground"> (client)</span>)}
          .
        </p>
        <p className="text-muted-foreground">
          Sign out if you want to create a new account with different details.
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
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" autoComplete="name" placeholder="Alex Morgan" value={name} onChange={(e) => setName(e.target.value)} required/>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required/>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required/>
        <p className="text-xs text-muted-foreground">
          Sign up saves your profile in this browser only (localStorage).
        </p>
      </div>
      <Button type="submit" className="w-full">
        {accountKind === "trainer" ? "Create coach account" : "Create client account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={loginHref} className="font-medium text-primary underline-offset-4 hover:underline">
          {accountKind === "trainer" ? "Coach sign in" : "Client sign in"}
        </Link>
      </p>
      {accountKind === "client" ? (<p className="text-center text-xs text-muted-foreground">
          Are you a coach?{" "}
          <Link href="/signup?intent=trainer" className="font-medium text-primary underline-offset-4 hover:underline">
            Coach workspace signup
          </Link>
        </p>) : (<p className="text-center text-xs text-muted-foreground">
          Here to book sessions?{" "}
          <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
            Client signup
          </Link>
        </p>)}
    </form>);
}
