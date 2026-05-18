"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { BrandLogoLink } from "@/components/site/brand-logo-link";
import { SiteHeaderNav, type SiteHeaderNavLink } from "@/components/site/site-header-nav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
const GUEST_LINKS: SiteHeaderNavLink[] = [
    { href: "/coaches", label: "Find coaches" },
    { href: "/pricing", label: "How it works" },
    { href: "/login", label: "Client sign in" },
    { href: "/trainer/login", label: "Coach sign in" },
    { href: "/signup", label: "Create account", variant: "primary" },
];
const CLIENT_AUTH_LINKS: SiteHeaderNavLink[] = [
    { href: "/me", label: "My FitBook" },
    { href: "/coaches", label: "Find coaches" },
];
const TRAINER_AUTH_LINKS: SiteHeaderNavLink[] = [
    { href: "/dashboard", label: "Coach workspace" },
    { href: "/coaches", label: "Find coaches" },
];
export function SitePublicHeader() {
    const { user, isHydrated, logout } = useAuth();
    const router = useRouter();
    const { links, logoHref, showLogout } = useMemo(() => {
        if (!isHydrated || !user) {
            return { links: GUEST_LINKS, logoHref: "/", showLogout: false };
        }
        if (user.role === "client") {
            return { links: CLIENT_AUTH_LINKS, logoHref: "/me", showLogout: true };
        }
        return { links: TRAINER_AUTH_LINKS, logoHref: "/dashboard", showLogout: true };
    }, [user, isHydrated]);
    function handleLogout() {
        void logout().then(() => router.replace("/"));
    }
    const trailingSlot = showLogout ? (<>
      <Button type="button" variant="outline" size="sm" className="hidden rounded-lg md:inline-flex" onClick={handleLogout}>
        Log out
      </Button>
      <Button type="button" variant="outline" size="sm" className="w-full rounded-lg md:hidden" onClick={handleLogout}>
        Log out
      </Button>
    </>) : null;
    return (<header className="sticky top-0 z-[100] border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl min-h-[5.25rem] items-center gap-3 px-4 py-2 sm:min-h-28 sm:gap-4 sm:px-6 sm:py-3">
        <BrandLogoLink size="nav" href={logoHref}/>
        <SiteHeaderNav links={links} trailingSlot={trailingSlot}/>
      </div>
    </header>);
}
