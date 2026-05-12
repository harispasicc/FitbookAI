import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
export const metadata: Metadata = {
    title: "Coach sign in",
    description: "Sign in to your FitBook AI coach workspace.",
};
export default function TrainerLoginPage() {
    return (<AuthShell title="Coach sign in" description="Coach workspace only — calendar, clients, and finances live here. Clients should use the regular sign-in page." footer={<p>
          Demo build — no server verification.{" "}
          <Link href="/coach/pricing" className="font-medium text-primary underline-offset-4 hover:underline">
            Coach software plans
          </Link>
          {" · "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Client sign in
          </Link>
          {" · "}
          <Link href="/" className="font-medium text-primary underline-offset-4 hover:underline">
            Home
          </Link>
        </p>}>
      <LoginForm variant="trainer"/>
    </AuthShell>);
}
