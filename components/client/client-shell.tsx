"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { CalendarDays, ChevronLeft, ChevronRight, Home, LayoutList, LogOut, Sparkles, TrendingUp, User, Users } from "lucide-react";
import { useEffect, useState } from "react";

const ClientNotifications = dynamic(
  () =>
    import("@/components/client/client-notifications").then(
      (mod) => mod.ClientNotifications,
    ),
  { ssr: false },
);
import { BrandLogoLink } from "@/components/site/brand-logo-link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { useIsBreakpointLg } from "@/hooks/use-is-breakpoint-lg";
import { BookingsProvider } from "@/contexts/bookings-data-context";
import { useAuth } from "@/contexts/auth-context";
import { deferEffect } from "@/lib/defer-effect";
import { cn } from "@/lib/utils";
type NavItem = {
    href: string;
    label: string;
    icon: LucideIcon;
};
const nav: NavItem[] = [
    { href: "/me", label: "Home", icon: Home },
    { href: "/me/sessions", label: "Sessions", icon: CalendarDays },
    { href: "/me/progress", label: "Progress", icon: TrendingUp },
    { href: "/coaches", label: "Find coaches", icon: Users },
    { href: "/me/ai", label: "FitBook AI", icon: Sparkles },
];
function isActive(pathname: string, href: string) {
    if (href === "/me")
        return pathname === "/me";
    return pathname === href || pathname.startsWith(`${href}/`);
}
function initials(name: string) {
    return name
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}
export function ClientShell({ children }: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout, user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const compact = collapsed && !mobileOpen;
    const isLg = useIsBreakpointLg();
    const showSidebarBrand = !compact;
    const showNavbarBrand = !mobileOpen && (!isLg || collapsed);
    useEffect(() => {
        deferEffect(() => setMobileOpen(false));
    }, [pathname]);
    function handleLogout() {
        void logout().then(() => {
            setMobileOpen(false);
            router.replace("/");
        });
    }
    return (<div className="flex min-h-dvh min-w-0 w-full items-stretch bg-background text-foreground">
      {mobileOpen ? (<button type="button" className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] lg:hidden" aria-label="Close menu" onClick={() => setMobileOpen(false)}/>) : null}

      <aside className={cn("fixed inset-y-0 left-0 z-50 flex min-h-dvh max-w-[100vw] flex-col border-r border-border bg-card pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] shadow-sm transition-[transform,width] duration-200 ease-out", "w-[min(15.5rem,calc(100vw-1rem))] lg:max-w-none lg:pb-0 lg:pt-0", mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0", compact ? "lg:w-[4.5rem]" : "lg:w-60", "lg:static lg:z-0 lg:min-h-dvh lg:shrink-0 lg:shadow-none")}>
        <div className="grid h-14 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-1 border-b border-border px-2">
          <div className={cn("min-w-0", compact ? "flex justify-center" : "px-1")}>
            {showSidebarBrand ? (<BrandLogoLink href="/me" size="nav" className="shrink-0 [&_.brand-logo-mark]:text-base sm:[&_.brand-logo-mark]:text-lg"/>) : null}
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <Button type="button" variant="ghost" size="icon" className="hidden size-8 shrink-0 lg:inline-flex" onClick={() => setCollapsed((c) => !c)} aria-expanded={!collapsed} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {collapsed ? <ChevronRight className="size-4"/> : <ChevronLeft className="size-4"/>}
            </Button>
            <Button type="button" variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <span className="text-lg leading-none">×</span>
            </Button>
          </div>
        </div>

        <div className="shrink-0 border-b border-border px-2 pb-2 pt-1">
          <p className={cn("truncate px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground", compact && "sr-only")}>
            Client app
          </p>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (<Link key={href} href={href} onClick={() => setMobileOpen(false)} className={cn("flex min-h-11 w-full min-w-0 touch-manipulation items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm transition-colors lg:min-h-0", active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/80", compact && "justify-center gap-0 px-0")}>
                <Icon className={cn("size-5 shrink-0", active ? "text-primary" : "text-muted-foreground")} aria-hidden/>
                <span className={cn("min-w-0 flex-1 truncate font-semibold leading-snug", compact && "sr-only")}>
                  {label}
                </span>
              </Link>);
        })}
        </nav>

        <div className="mt-auto shrink-0 border-t border-border p-2">
          <Button type="button" variant="ghost" onClick={handleLogout} className={cn("h-auto min-h-11 w-full justify-start gap-3 rounded-xl px-2.5 py-2.5 hover:bg-destructive/10 hover:text-destructive", compact && "justify-center px-0")}>
            <LogOut className="size-5 shrink-0" aria-hidden/>
            <span className={cn("text-sm font-semibold", compact && "sr-only")}>Log out</span>
          </Button>
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-14 min-w-0 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-2 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:gap-3 sm:px-3 sm:py-0 md:gap-4 md:px-4">
          <Button type="button" variant="ghost" size="icon" className="size-10 shrink-0 touch-manipulation lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <LayoutList className="size-5"/>
          </Button>
          {showNavbarBrand ? (<BrandLogoLink href="/me" size="nav" className="min-w-0 max-w-[min(100%,200px)] shrink-0 [&_.brand-logo-mark]:text-base sm:[&_.brand-logo-mark]:text-lg lg:[&_.brand-logo-mark]:text-lg" caption={<span className="truncate text-[11px] font-medium leading-tight text-muted-foreground lg:sr-only">
                  Train · book · track
                </span>}/>) : null}
          <div className="min-h-9 min-w-0 flex-1" aria-hidden/>
          <ClientNotifications />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="size-10 shrink-0 touch-manipulation rounded-full" aria-label="Account menu">
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs font-medium">{initials(user?.name ?? "U")}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-0.5">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/me/profile" className="flex cursor-pointer items-center gap-2">
                  <User className="size-4"/>
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(e) => {
            e.preventDefault();
            handleLogout();
        }}>
                <LogOut className="size-4"/>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto w-full min-w-0 max-w-6xl px-3 py-6 min-[400px]:px-4 sm:px-6 sm:py-8 lg:px-8">
            <BookingsProvider>{children}</BookingsProvider>
          </div>
        </main>
      </div>
    </div>);
}
