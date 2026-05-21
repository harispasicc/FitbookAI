import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your FitBook AI account.",
};

function pickString(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string" && value.length > 0) return value;
  if (Array.isArray(value) && typeof value[0] === "string" && value[0].length > 0) {
    return value[0];
  }
  return undefined;
}

type ResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const sp = await searchParams;
  const token = pickString(sp.token) ?? "";
  const portal = pickString(sp.portal);
  const isTrainer = portal === "trainer";

  return (
    <AuthShell
      title="Choose a new password"
      description="Enter a new password for your account. Links expire after one hour."
      footer={
        <p>
          <Link
            href={isTrainer ? "/trainer/login" : "/login"}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      }
    >
      <ResetPasswordForm token={token} variant={isTrainer ? "trainer" : "client"} />
    </AuthShell>
  );
}
