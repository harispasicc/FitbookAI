"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
type AppRole = "client" | "trainer";
export function RoleGuard({ role, redirectTo, children, }: {
    role: AppRole;
    redirectTo: string;
    children: React.ReactNode;
}) {
    const { user, isHydrated } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!isHydrated || !user)
            return;
        if (user.role !== role) {
            router.replace(redirectTo);
        }
    }, [isHydrated, user, role, redirectTo, router]);
    if (!isHydrated || !user) {
        return (<div className="flex min-h-dvh flex-1 flex-col items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="size-8 animate-spin" aria-hidden/>
        <span className="sr-only">Loading</span>
      </div>);
    }
    if (user.role !== role) {
        return (<div className="flex min-h-dvh flex-1 flex-col items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="size-8 animate-spin" aria-hidden/>
        <span className="sr-only">Redirecting</span>
      </div>);
    }
    return <>{children}</>;
}
