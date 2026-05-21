import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { CLIENT_DEMO_LOGIN_PATH, CLIENT_LOGIN_PATH } from "@/lib/site-nav";

export const metadata: Metadata = {
  title: "Coach sign in",
  description: "Sign in to your FitBook AI coach workspace.",
};

function pickString(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string" && value.length > 0) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].length > 0) {
    return value[0];
  }
  return undefined;
}

type TrainerLoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TrainerLoginPage({ searchParams }: TrainerLoginPageProps) {
  const sp = await searchParams;
  const demoMode = pickString(sp.demo) === "1" || pickString(sp.demo) === "true";

  const description = demoMode
    ? "Use a pre-seeded coach account to explore the workspace in one click."
    : "Coach workspace only. Calendar, clients, and finances live here. Clients should use client sign in.";

  const footer = demoMode ? (
    <p>
      <Link
        href={CLIENT_LOGIN_PATH}
        className="font-medium text-primary underline-offset-4 hover:underline"
      >
        Sign in with your account
      </Link>
      {" · "}
      <Link
        href={CLIENT_DEMO_LOGIN_PATH}
        className="font-medium text-primary underline-offset-4 hover:underline"
      >
        Client demo
      </Link>
    </p>
  ) : (
    <p>
      <Link href="/coach/pricing" className="font-medium text-primary underline-offset-4 hover:underline">
        Coach software plans
      </Link>
      {" · "}
      <Link href={CLIENT_LOGIN_PATH} className="font-medium text-primary underline-offset-4 hover:underline">
        Client sign in
      </Link>
      {" · "}
      <Link href="/" className="font-medium text-primary underline-offset-4 hover:underline">
        Home
      </Link>
    </p>
  );

  return (
    <AuthShell
      title={demoMode ? "Try the coach demo" : "Coach sign in"}
      description={description}
      footer={footer}
    >
      <LoginForm variant="trainer" demoMode={demoMode} />
    </AuthShell>
  );
}
