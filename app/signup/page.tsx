import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { TrainerFlowBanner } from "@/components/auth/trainer-flow-banner";
import { getTrainerById } from "@/lib/mock-trainers";
export const metadata: Metadata = {
    title: "Create account",
    description: "Create a FitBook AI client or coach account.",
};
function pickString(value: string | string[] | undefined): string | undefined {
    if (typeof value === "string" && value.length > 0)
        return value;
    if (Array.isArray(value) && typeof value[0] === "string" && value[0].length > 0)
        return value[0];
    return undefined;
}
type SignupPageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export default async function SignupPage({ searchParams }: SignupPageProps) {
    const sp = await searchParams;
    const trainerSlug = pickString(sp.trainer);
    const intentRaw = pickString(sp.intent);
    const isTrainerIntent = intentRaw === "trainer";
    const trainer = !isTrainerIntent && trainerSlug ? getTrainerById(trainerSlug) : undefined;
    const title = isTrainerIntent ? "Create a coach workspace" : "Create your client account";
    const description = isTrainerIntent
        ? "Create your coach workspace. Your profile is saved to FitBook and listed for clients to discover."
        : "Find coaches, book sessions, and track your progress with your FitBook client account.";
    return (<AuthShell title={title} description={description} footer={<p>
          By continuing, you agree to FitBook&apos;s{" "}
          <Link href="/privacy#terms" className="font-medium text-primary underline-offset-4 hover:underline">
            Terms of Service
          </Link>
          {" and "}
          <Link href="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
          .{" "}
          <Link href="/coaches" className="font-medium text-primary underline-offset-4 hover:underline">
            Browse coaches
          </Link>
        </p>}>
      {trainer ? <TrainerFlowBanner mode="signup" trainer={trainer}/> : null}
      <SignupForm accountKind={isTrainerIntent ? "trainer" : "client"} trainerId={trainer?.id}/>
    </AuthShell>);
}
