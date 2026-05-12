"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
type TrainerProfileBookingCtaProps = {
    trainerId: string;
};
export function TrainerProfileBookingCta({ trainerId }: TrainerProfileBookingCtaProps) {
    const { user, isHydrated, selectTrainerForClient } = useAuth();
    const router = useRouter();
    if (!isHydrated) {
        return (<div className="mt-6 h-11 w-full animate-pulse rounded-xl bg-muted" aria-hidden/>);
    }
    const isClient = user?.role === "client";
    const ctaClass = "mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90";
    if (isClient) {
        return (<Button type="button" className={ctaClass} onClick={() => {
                selectTrainerForClient(trainerId);
                router.push("/me");
            }}>
        Select coach
      </Button>);
    }
    return (<Link href={`/signup?trainer=${encodeURIComponent(trainerId)}`} className={ctaClass}>
      Register to select
    </Link>);
}
