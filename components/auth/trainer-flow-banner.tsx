import Link from "next/link";
import type { MockTrainer } from "@/lib/mock-trainers";
type TrainerFlowBannerProps = {
    trainer: MockTrainer;
    mode: "signup" | "login";
};
export function TrainerFlowBanner({ trainer, mode }: TrainerFlowBannerProps) {
    const profileHref = `/coaches/${trainer.id}`;
    if (mode === "login") {
        return (<div className="mb-4 rounded-lg border border-primary/25 bg-primary/5 px-3 py-3 text-left text-sm">
        <p className="font-medium text-foreground">Booking with {trainer.name}?</p>
        <p className="mt-1 text-muted-foreground">
          Client sign in to continue. If you don&apos;t have an account yet, create one from their profile. Your coach
          preference is saved on this device after sign-up or sign-in.
        </p>
        <Link href={`/signup?trainer=${encodeURIComponent(trainer.id)}`} className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
          Create account to book {trainer.name}
        </Link>
        {" · "}
        <Link href={profileHref} className="text-xs font-medium text-primary hover:underline">
          View profile
        </Link>
      </div>);
    }
    return (<div className="mb-4 rounded-lg border border-primary/25 bg-primary/5 px-3 py-3 text-left text-sm">
      <p className="font-medium text-foreground">You&apos;re continuing with {trainer.name}</p>
      <p className="mt-1 text-muted-foreground">
        After you create a client account, you&apos;ll be able to book their sessions and track your progress here
        (demo: saved in this browser only).
      </p>
      <Link href={profileHref} className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
        View profile again
      </Link>
    </div>);
}
