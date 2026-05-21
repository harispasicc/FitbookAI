import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your FitBook AI account password.",
};

function pickString(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string" && value.length > 0) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].length > 0) {
    return value[0];
  }
  return undefined;
}

type ForgotPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const sp = await searchParams;
  const portal = pickString(sp.portal);
  const isTrainer = portal === "trainer";

  return (
    <AuthShell
      title="Forgot password?"
      description={
        isTrainer
          ? "We will email coach workspace users a secure link to choose a new password."
          : "We will email you a secure link to choose a new password."
      }
      footer={
        <p>
          Remember your password?{" "}
          <Link
            href={isTrainer ? "/trainer/login" : "/login"}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm variant={isTrainer ? "trainer" : "client"} />
    </AuthShell>
  );
}
