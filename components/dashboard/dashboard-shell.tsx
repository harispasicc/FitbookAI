"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { BarChart3, CalendarDays, ChevronLeft, ChevronRight, CreditCard, Dumbbell, LogOut, LayoutGrid, Settings, Sparkles, Users, X, } from "lucide-react";
import { useState } from "react";
import { BrandLogoLink } from "@/components/site/brand-logo-link";
import { useIsBreakpointLg } from "@/hooks/use-is-breakpoint-lg";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DashboardTopBar } from "@/components/dashboard/dashboard-topbar";
import { BookingsProvider } from "@/contexts/bookings-data-context";
import { TrainerWorkspaceProvider } from "@/contexts/trainer-workspace-context";
import { useAuth } from "@/contexts/auth-context";
import { useTrainerPlan } from "@/hooks/use-trainer-plan";
import { TRAINER_NAV_GATES } from "@/lib/trainer-plans";
type NavItem = {
    href: string;
    label: string;
    sub?: string;
    icon: LucideIcon;
};
const nav: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/clients", label: "Clients", icon: Users },
    { href: "/services", label: "Services", icon: Dumbbell },
    { href: "/ai", label: "AI Assistant", icon: Sparkles },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/payments", label: "Payments", sub: "Soon", icon: CreditCard },
    { href: "/settings", label: "Settings", icon: Settings },
];
function isActive(pathname: string, href: string) {
    if (href === "/dashboard")
        return pathname === "/dashboard";
    if (href === "/clients")
        return pathname === "/clients" || pathname.startsWith("/clients/");
    return pathname === href || pathname.startsWith(`${href}/`);
}
export function DashboardShell({ children }: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();
    const { canAccessRoute, planContext } = useTrainerPlan();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    function handleLogout() {
        void logout().then(() => {
            setMobileOpen(false);
            router.replace("/");
        });
    }
    function toggleCollapsed() {
        setCollapsed((current) => !current);
    }
    const compact = collapsed && !mobileOpen;
    const isLg = useIsBreakpointLg();
    const showSidebarBrand = !compact;
    const showNavbarBrand = !mobileOpen && (!isLg || collapsed);
    return (<div className="flex min-h-dvh min-w-0 w-full items-stretch bg-background text-foreground">
      {mobileOpen ? (<button type="button" className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] lg:hidden" aria-label="Close menu" onClick={() => setMobileOpen(false)}/>) : null}

      <aside id="dashboard-sidebar" data-compact={compact ? "true" : "false"} className={cn("fixed inset-y-0 left-0 z-50 flex min-h-dvh max-w-[100vw] flex-col border-r border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] text-zinc-900 shadow-sm transition-[transform,width] duration-200 ease-out", "w-[min(15.5rem,calc(100vw-1rem))] lg:max-w-none lg:pb-0 lg:pt-0", mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0", compact ? "lg:w-[4.5rem]" : "lg:w-60", "lg:static lg:z-0 lg:min-h-dvh lg:shrink-0 lg:shadow-none")}>
        
        <div className="grid h-14 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-1 border-b border-zinc-200 px-2">
          <div className={cn("min-w-0", compact ? "flex justify-center" : "px-1")}>
            {showSidebarBrand ? (<BrandLogoLink href="/dashboard" size="nav" onClick={() => setMobileOpen(false)} className={cn("max-w-full rounded-lg py-1 text-zinc-900 transition-colors hover:bg-zinc-100", !compact && "w-full min-w-0", "[&_.brand-logo-mark]:text-base sm:[&_.brand-logo-mark]:text-lg")} caption={<span className="sidebar-nav-label-muted block truncate pl-0.5 text-[11px] font-medium leading-tight">
                    Coach OS
                  </span>}/>) : null}
          </div>
          <div className="flex shrink-0 items-center justify-end gap-0.5">
            <Button type="button" variant="ghost" size="icon" className="hidden size-8 shrink-0 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 lg:inline-flex" onClick={toggleCollapsed} aria-expanded={!collapsed} aria-label={collapsed ? "Proširi sidebar" : "Sažmi sidebar"}>
              {collapsed ? <ChevronRight className="size-4"/> : <ChevronLeft className="size-4"/>}
            </Button>
            <Button type="button" variant="ghost" size="icon" className="shrink-0 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Zatvori izbornik">
              <X className="size-5"/>
            </Button>
          </div>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden p-2">
          {nav.map(({ href, label, sub, icon: Icon }) => {
            const active = isActive(pathname, href);
            const gate = TRAINER_NAV_GATES[href];
            const locked = gate ? !canAccessRoute(href) : false;
            const tip = locked
              ? `${label} — requires ${gate!.badge}`
              : sub
                ? `${label} — ${sub}`
                : label;
            return (<Link key={href} href={href} title={tip} onClick={() => setMobileOpen(false)} className={cn("flex min-h-11 w-full min-w-0 touch-manipulation items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm transition-colors lg:min-h-0", active
                    ? "bg-orange-50 text-orange-600"
                    : locked
                      ? "text-zinc-500 hover:bg-zinc-100"
                      : "text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950", compact && "justify-center gap-0 px-0 py-2.5")}>
                <Icon className={cn("size-5 shrink-0 stroke-[1.75]", active ? "text-orange-600" : locked ? "text-zinc-400" : "text-zinc-800")} aria-hidden/>
                <span className="sidebar-nav-label flex min-h-0 min-w-0 flex-1 flex-col items-stretch overflow-hidden leading-snug">
                  <span className={cn("block truncate font-semibold tracking-tight", active ? "text-orange-600" : "text-zinc-900")}>
                    {label}
                  </span>
                  {sub ? (<span className={cn("mt-0.5 block truncate text-xs font-medium", active ? "text-orange-500/90" : "sidebar-nav-label-muted")}>
                      {sub}
                    </span>) : locked ? (<span className="mt-0.5 block truncate text-xs font-medium text-primary">
                      {gate!.badge}
                    </span>) : null}
                </span>
              </Link>);
        })}
        </nav>

        <div className="mt-auto shrink-0 border-t border-zinc-200 p-2">
          {!compact && planContext ? (
            <p className="sidebar-nav-label mb-2 px-2.5 text-[11px] text-zinc-500">
              Plan:{" "}
              <span className="font-semibold text-zinc-800">{planContext.planName}</span>
            </p>
          ) : null}
          <Button type="button" variant="ghost" title="Odjavi se" onClick={handleLogout} className={cn("h-auto min-h-11 w-full justify-start gap-3 rounded-xl px-2.5 py-2.5 text-zinc-800 hover:bg-red-50 hover:text-red-700", compact && "justify-center px-0")}>
            <LogOut className="size-5 shrink-0 text-zinc-600" aria-hidden/>
            <span className="sidebar-nav-label flex min-w-0 flex-1 flex-col items-start text-left">
              <span className="text-sm font-semibold">Log out</span>
            </span>
          </Button>
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col bg-background">
        <DashboardTopBar onMenuClick={() => setMobileOpen(true)} showBrandInNavbar={showNavbarBrand}/>
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto w-full min-w-0 max-w-6xl px-3 py-6 min-[400px]:px-4 sm:px-6 sm:py-8 lg:px-8 lg:py-10 2xl:max-w-7xl">
            <BookingsProvider>
              <TrainerWorkspaceProvider>{children}</TrainerWorkspaceProvider>
            </BookingsProvider>
          </div>
        </main>
      </div>
    </div>);
}
