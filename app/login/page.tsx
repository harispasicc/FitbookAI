import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { TrainerFlowBanner } from "@/components/auth/trainer-flow-banner";
import { getTrainerById } from "@/lib/mock-trainers";
export const metadata: Metadata = {
    title: "Client sign in",
    description: "Sign in to FitBook AI (demo)",
};
function pickString(value: string | string[] | undefined): string | undefined {
    if (typeof value === "string" && value.length > 0)
        return value;
    if (Array.isArray(value) && typeof value[0] === "string" && value[0].length > 0)
        return value[0];
    return undefined;
}
type LoginPageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export default async function LoginPage({ searchParams }: LoginPageProps) {
    const sp = await searchParams;
    const trainerSlug = pickString(sp.trainer);
    const trainer = trainerSlug ? getTrainerById(trainerSlug) : undefined;
    const description = trainer
        ? `We will attach ${trainer.name} to your session on this device after sign-in (demo).`
        : "Book coaches and track progress. Coaches use coach sign in.";
    return (<AuthShell title="Welcome back" description={description} footer={<p>
          Frontend-only for now — replace with real auth when your API is ready.{" "}
          <a href="/coaches" className="font-medium text-primary underline-offset-4 hover:underline">
            Find coaches
          </a>
          {" · "}
          <a href="/trainer/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Coach sign in
          </a>
        </p>}>
      {trainer ? <TrainerFlowBanner mode="login" trainer={trainer}/> : null}
      <LoginForm variant="client" trainerId={trainer?.id}/>
    </AuthShell>);
}
