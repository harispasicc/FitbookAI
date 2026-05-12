"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
export function AuthGuard({ children }: {
    children: React.ReactNode;
}) {
    const { user, isHydrated } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!isHydrated)
            return;
        if (!user) {
            router.replace("/");
        }
    }, [isHydrated, user, router]);
    if (!isHydrated) {
        return (<div className="flex min-h-dvh flex-1 flex-col items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="size-8 animate-spin" aria-hidden/>
        <span className="sr-only">Loading session</span>
      </div>);
    }
    if (!user) {
        return (<div className="flex min-h-dvh flex-1 flex-col items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="size-8 animate-spin" aria-hidden/>
        <span className="sr-only">Redirecting</span>
      </div>);
    }
    return <>{children}</>;
}
