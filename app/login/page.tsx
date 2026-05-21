import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { TrainerFlowBanner } from "@/components/auth/trainer-flow-banner";
import { getTrainerById } from "@/lib/mock-trainers";
import {
  CLIENT_LOGIN_PATH,
  TRAINER_DEMO_LOGIN_PATH,
  TRAINER_LOGIN_PATH,
} from "@/lib/site-nav";
export const metadata: Metadata = {
  title: "Client sign in",
  description: "Sign in to FitBook AI",
};
function pickString(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string" && value.length > 0) return value;
  if (
    Array.isArray(value) &&
    typeof value[0] === "string" &&
    value[0].length > 0
  )
    return value[0];
  return undefined;
}
type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const sp = await searchParams;
  const trainerSlug = pickString(sp.trainer);
  const sessionExpired = pickString(sp.session) === "expired";
  const demoMode =
    pickString(sp.demo) === "1" || pickString(sp.demo) === "true";
  const trainer = trainerSlug ? getTrainerById(trainerSlug) : undefined;
  const description = demoMode
    ? "Use a pre-seeded demo account to explore the client experience in one click."
    : trainer
      ? `We will attach ${trainer.name} to your session after sign-in.`
      : "Sign in with your email and password, or create an account.";
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
        href={TRAINER_DEMO_LOGIN_PATH}
        className="font-medium text-primary underline-offset-4 hover:underline"
      >
        Coach demo
      </Link>
    </p>
  ) : (
    <p>
      <Link
        href="/coaches"
        className="font-medium text-primary underline-offset-4 hover:underline"
      >
        Find coaches
      </Link>
      {" · "}
      <Link
        href={TRAINER_LOGIN_PATH}
        className="font-medium text-primary underline-offset-4 hover:underline"
      >
        Coach sign in
      </Link>
    </p>
  );

  return (
    <AuthShell
      title={demoMode ? "Try the client demo" : "Client sign in"}
      description={description}
      footer={footer}
    >
      {trainer ? <TrainerFlowBanner mode="login" trainer={trainer} /> : null}
      <LoginForm
        variant="client"
        trainerId={trainer?.id}
        sessionExpired={sessionExpired}
        demoMode={demoMode}
      />
    </AuthShell>
  );
}
