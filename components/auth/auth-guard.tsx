"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  consumePostLogoutRedirect,
  consumeSessionExpiredFlag,
} from "@/lib/auth-session-events";
import { AuthTransitionScreen } from "@/components/auth/auth-transition-screen";

export function AuthGuard({ children }: {
    children: React.ReactNode;
}) {
    const { user, isHydrated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isHydrated)
            return;
        if (!user) {
            if (consumePostLogoutRedirect()) {
                router.replace("/");
                return;
            }
            const expired = consumeSessionExpiredFlag();
            if (expired) {
                router.replace("/login?session=expired");
                return;
            }
            const next = pathname?.startsWith("/me")
                ? "/login"
                : pathname?.startsWith("/dashboard") ||
                    pathname?.startsWith("/calendar") ||
                    pathname?.startsWith("/clients") ||
                    pathname?.startsWith("/services") ||
                    pathname?.startsWith("/analytics") ||
                    pathname?.startsWith("/ai") ||
                    pathname?.startsWith("/settings") ||
                    pathname?.startsWith("/profile") ||
                    pathname?.startsWith("/payments")
                  ? "/trainer/login"
                  : "/login";
            router.replace(next);
        }
    }, [isHydrated, user, router, pathname]);
    if (!isHydrated) {
        return <AuthTransitionScreen variant="fullscreen" />;
    }
    if (!user) {
        return <AuthTransitionScreen variant="fullscreen" />;
    }
    return <>{children}</>;
}
