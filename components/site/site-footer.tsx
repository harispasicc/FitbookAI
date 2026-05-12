"use client";
import Link from "next/link";
import { useMemo } from "react";
import { BrandLogoLink } from "@/components/site/brand-logo-link";
import { useAuth } from "@/contexts/auth-context";
const guestMainLinks = [
    { href: "/about", label: "About us" },
    { href: "/product", label: "Services" },
    { href: "/privacy", label: "Policy" },
    { href: "/contact", label: "Contact" },
] as const;
const guestExtraLinks = [
    { href: "/coaches", label: "Find coaches" },
    { href: "/pricing", label: "How it works" },
    { href: "/coach/pricing", label: "Coach plans" },
    { href: "/#features", label: "Features" },
] as const;
const signedInLinks = [
    { href: "/privacy", label: "Policy" },
    { href: "/contact", label: "Contact" },
] as const;
export function SiteFooter() {
    const { user, isHydrated } = useAuth();
    const { appHome, links } = useMemo(() => {
        if (!isHydrated || !user) {
            return {
                appHome: null as {
                    href: string;
                    label: string;
                } | null,
                links: [...guestMainLinks, ...guestExtraLinks] as {
                    href: string;
                    label: string;
                }[],
            };
        }
        if (user.role === "client") {
            return {
                appHome: { href: "/me", label: "My FitBook" } as const,
                links: [...signedInLinks, { href: "/coaches", label: "Find coaches" }] as {
                    href: string;
                    label: string;
                }[],
            };
        }
        return {
            appHome: { href: "/dashboard", label: "Coach workspace" } as const,
            links: [...signedInLinks, { href: "/coach/pricing", label: "Coach plans" }] as {
                href: string;
                label: string;
            }[],
        };
    }, [user, isHydrated]);
    return (<footer className="border-t border-border/80 py-8 sm:py-10">
      <div className="mx-auto min-w-0 max-w-6xl px-3 min-[400px]:px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:text-left lg:gap-10">
          <BrandLogoLink size="footer" href={appHome?.href ?? "/"} className="sm:mr-auto sm:self-center"/>
          <nav className="flex shrink-0 flex-wrap content-center items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground sm:justify-end sm:self-center" aria-label="Footer">
            {appHome ? (<Link href={appHome.href} className="whitespace-nowrap font-medium text-foreground hover:underline">
                {appHome.label}
              </Link>) : null}
            {links.map(({ href, label }) => (<Link key={href} href={href} className="whitespace-nowrap hover:text-foreground">
                {label}
              </Link>))}
          </nav>
        </div>
        <div className="mt-6 border-t border-border/60 pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} FitBook AI</p>
        </div>
      </div>
    </footer>);
}
