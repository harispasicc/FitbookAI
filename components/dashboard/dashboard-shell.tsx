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
import { SidebarNavTooltip } from "@/components/dashboard/sidebar-nav-tooltip";
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
    ai?: boolean;
};
const nav: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/calendar", label: "Calendar", icon: CalendarDays },
    { href: "/clients", label: "Clients", icon: Users },
    { href: "/services", label: "Services", icon: Dumbbell },
    { href: "/ai", label: "AI Assistant", icon: Sparkles, ai: true },
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

      <aside id="dashboard-sidebar" data-compact={compact ? "true" : "false"} className={cn("fixed inset-y-0 left-0 z-50 flex min-h-dvh max-w-[100vw] flex-col border-r-0 bg-gradient-to-b from-zinc-100/90 via-white to-zinc-50/80 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] text-zinc-900 shadow-[4px_0_24px_-8px_rgba(0,0,0,0.08)] transition-[transform,width] duration-300 ease-out", "w-[min(16rem,calc(100vw-1rem))] lg:max-w-none lg:pb-0 lg:pt-0", mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0", compact ? "lg:w-[4.75rem]" : "lg:w-[15.5rem]", "lg:relative lg:z-40 lg:min-h-dvh lg:shrink-0 lg:overflow-visible")}>
        
        <div className="grid h-[3.75rem] shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3">
          <div className={cn("min-w-0", compact ? "flex justify-center" : "")}>
            {showSidebarBrand ? (<BrandLogoLink href="/dashboard" size="nav" onClick={() => setMobileOpen(false)} className={cn("max-w-full rounded-xl py-1.5 text-zinc-900 transition-all hover:bg-white/80", !compact && "w-full min-w-0", "[&_.brand-logo-mark]:text-base sm:[&_.brand-logo-mark]:text-lg")} caption={<span className="sidebar-nav-label-muted block truncate pl-0.5 text-[11px] font-semibold leading-tight text-violet-600/90">
                    AI Coach OS
                  </span>}/>) : null}
          </div>
          <div className="flex shrink-0 items-center justify-end gap-0.5">
            <Button type="button" variant="ghost" size="icon" className="hidden size-9 shrink-0 rounded-xl text-zinc-600 transition-all hover:bg-white hover:shadow-sm lg:inline-flex" onClick={toggleCollapsed} aria-expanded={!collapsed} aria-label={collapsed ? "Proširi sidebar" : "Sažmi sidebar"}>
              {collapsed ? <ChevronRight className="size-4"/> : <ChevronLeft className="size-4"/>}
            </Button>
            <Button type="button" variant="ghost" size="icon" className="size-9 shrink-0 rounded-xl text-zinc-600 hover:bg-white lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Zatvori izbornik">
              <X className="size-5"/>
            </Button>
          </div>
        </div>

        <nav className={cn("flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-2", compact ? "overflow-x-visible" : "overflow-x-hidden")}>
          {nav.map(({ href, label, sub, icon: Icon, ai }) => {
            const active = isActive(pathname, href);
            const gate = TRAINER_NAV_GATES[href];
            const locked = gate ? !canAccessRoute(href) : false;
            const tipLabel = locked ? `${label} (${gate!.badge} required)` : label;
            const tipSub = sub ?? (locked ? gate!.badge : undefined);
            return (
            <SidebarNavTooltip
              key={href}
              label={tipLabel}
              sub={tipSub}
              show={compact}
            >
            <Link key={href} href={href} title={compact ? undefined : tipLabel} onClick={() => setMobileOpen(false)} className={cn("group relative flex min-h-[2.75rem] w-full min-w-0 touch-manipulation items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-all duration-200 ease-out lg:min-h-[2.625rem]", active
                    ? cn(
                        "bg-white font-semibold shadow-md shadow-black/[0.06]",
                        ai ? "text-violet-700" : "text-orange-600",
                        "before:absolute before:bottom-2.5 before:left-0 before:top-2.5 before:w-[3px] before:rounded-r-full",
                        ai ? "before:bg-violet-500" : "before:bg-orange-500",
                      )
                    : locked
                      ? "text-zinc-500 hover:bg-white/70"
                      : "text-zinc-700 hover:translate-x-0.5 hover:bg-white/90 hover:text-zinc-950 hover:shadow-sm",
                  compact && "justify-center gap-0 px-2 py-2.5 before:hidden")}>
                <span className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                  active
                    ? ai ? "bg-violet-500/12 text-violet-600" : "bg-orange-500/12 text-orange-600"
                    : "bg-zinc-200/50 text-zinc-600 group-hover:bg-white group-hover:text-zinc-900",
                )}>
                  <Icon className="size-[1.15rem] stroke-[1.85]" aria-hidden/>
                </span>
                <span className={cn("sidebar-nav-label flex min-h-0 min-w-0 flex-1 flex-col items-stretch overflow-hidden leading-snug", compact && "hidden")}>
                  <span className="flex items-center gap-2">
                    <span className={cn("block truncate font-semibold tracking-tight", active ? (ai ? "text-violet-700" : "text-orange-600") : "text-zinc-900")}>
                      {label}
                    </span>
                    {sub ? (
                      <span className="shrink-0 rounded-full bg-zinc-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-600">
                        {sub}
                      </span>
                    ) : null}
                  </span>
                  {locked && !sub ? (<span className="mt-0.5 block truncate text-xs font-medium text-primary">
                      {gate!.badge}
                    </span>) : null}
                </span>
              </Link>
            </SidebarNavTooltip>
            );
        })}
        </nav>

        <div className="mt-auto shrink-0 px-3 pb-3 pt-2">
          {!compact && planContext ? (
            <p className="sidebar-nav-label mb-2.5 rounded-2xl bg-white/80 px-3 py-2.5 text-xs font-medium text-zinc-600 shadow-sm">
              Plan{" "}
              <span className="font-bold text-zinc-900">{planContext.planName}</span>
            </p>
          ) : null}
          <Button type="button" variant="ghost" title="Odjavi se" onClick={handleLogout} className={cn("h-auto min-h-[2.75rem] w-full justify-start gap-3 rounded-2xl px-3 py-2.5 text-zinc-700 transition-all duration-200 hover:bg-red-50 hover:text-red-700 hover:shadow-sm", compact && "justify-center px-2")}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-zinc-200/40">
              <LogOut className="size-[1.15rem] text-zinc-500" aria-hidden/>
            </span>
            <span className="sidebar-nav-label flex min-w-0 flex-1 flex-col items-start text-left">
              <span className="text-sm font-semibold">Log out</span>
            </span>
          </Button>
        </div>
      </aside>

      <BookingsProvider>
        <TrainerWorkspaceProvider>
          <div className="relative z-0 flex min-h-dvh min-w-0 flex-1 flex-col bg-background">
            <DashboardTopBar onMenuClick={() => setMobileOpen(true)} showBrandInNavbar={showNavbarBrand}/>
            <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
              <div className="mx-auto w-full min-w-0 max-w-6xl px-3 py-5 min-[400px]:px-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 2xl:max-w-7xl">
                {children}
              </div>
            </main>
          </div>
        </TrainerWorkspaceProvider>
      </BookingsProvider>
    </div>);
}
