"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { AuthTransitionScreen } from "@/components/auth/auth-transition-screen";
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
        return <AuthTransitionScreen variant="fullscreen" />;
    }
    if (user.role !== role) {
        return <AuthTransitionScreen variant="fullscreen" />;
    }
    return <>{children}</>;
}
