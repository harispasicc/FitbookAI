"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutList,
  LogOut,
  Sparkles,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarNavTooltip } from "@/components/dashboard/sidebar-nav-tooltip";
import { BrandLogoLink } from "@/components/site/brand-logo-link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsBreakpointLg } from "@/hooks/use-is-breakpoint-lg";
import { BookingsProvider } from "@/contexts/bookings-data-context";
import { useAuth } from "@/contexts/auth-context";
import { deferEffect } from "@/lib/defer-effect";
import { cn } from "@/lib/utils";

const ClientNotifications = dynamic(
  () =>
    import("@/components/client/client-notifications").then(
      (mod) => mod.ClientNotifications,
    ),
  { ssr: false },
);

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  ai?: boolean;
};

const nav: NavItem[] = [
  { href: "/me", label: "Home", icon: Home },
  { href: "/me/sessions", label: "Sessions", icon: CalendarDays },
  { href: "/me/progress", label: "Progress", icon: TrendingUp },
  { href: "/coaches", label: "Find coaches", icon: Users },
  { href: "/me/ai", label: "FitBook AI", icon: Sparkles, ai: true },
];

function isActive(pathname: string, href: string) {
  if (href === "/me") return pathname === "/me";
  if (href === "/coaches")
    return pathname === "/coaches" || pathname.startsWith("/coaches/");
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

export function ClientShell({ children }: { children: React.ReactNode }) {
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

  function toggleCollapsed() {
    setCollapsed((c) => !c);
  }

  return (
    <div className="flex min-h-dvh min-w-0 w-full items-stretch bg-background text-foreground">
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        id="client-sidebar"
        data-compact={compact ? "true" : "false"}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex min-h-dvh max-w-[100vw] flex-col border-r-0",
          "bg-gradient-to-b from-teal-50/80 via-white to-violet-50/40",
          "pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]",
          "text-foreground shadow-[4px_0_24px_-8px_rgba(0,0,0,0.08)]",
          "transition-[transform,width] duration-300 ease-out",
          "w-[min(16rem,calc(100vw-1rem))] lg:max-w-none lg:pb-0 lg:pt-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          compact ? "lg:w-[4.75rem]" : "lg:w-[15.5rem]",
          "lg:relative lg:z-40 lg:min-h-dvh lg:shrink-0 lg:overflow-visible",
        )}
      >
        <div className="grid h-[3.75rem] shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3">
          <div className={cn("min-w-0", compact ? "flex justify-center" : "")}>
            {showSidebarBrand ? (
              <BrandLogoLink
                href="/me"
                size="nav"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "max-w-full rounded-xl py-1.5 transition-all hover:bg-white/80",
                  !compact && "w-full min-w-0",
                  "[&_.brand-logo-mark]:text-base sm:[&_.brand-logo-mark]:text-lg",
                )}
                caption={
                  <span className="sidebar-nav-label-muted block truncate pl-0.5 text-[11px] font-semibold leading-tight text-teal-700/90">
                    Client · AI training
                  </span>
                }
              />
            ) : null}
          </div>
          <div className="flex shrink-0 items-center justify-end gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hidden size-9 shrink-0 rounded-xl text-zinc-600 transition-all hover:bg-white hover:shadow-sm lg:inline-flex"
              onClick={toggleCollapsed}
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="size-4" />
              ) : (
                <ChevronLeft className="size-4" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-xl lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="size-5" />
            </Button>
          </div>
        </div>

        {!compact ? (
          <div className="shrink-0 px-4 pb-1 pt-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
              Client app
            </p>
          </div>
        ) : null}

        <nav
          className={cn(
            "flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-2",
            compact ? "overflow-x-visible" : "overflow-x-hidden",
          )}
        >
          {nav.map(({ href, label, icon: Icon, ai }) => {
            const active = isActive(pathname, href);
            return (
              <SidebarNavTooltip key={href} label={label} show={compact}>
                <Link
                  href={href}
                  title={compact ? undefined : label}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "group relative flex min-h-[2.75rem] w-full min-w-0 touch-manipulation items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-all duration-200 ease-out lg:min-h-[2.625rem]",
                    active
                      ? cn(
                          "bg-white font-semibold shadow-md shadow-black/[0.06]",
                          ai ? "text-violet-700" : "text-teal-700",
                          "before:absolute before:bottom-2.5 before:left-0 before:top-2.5 before:w-[3px] before:rounded-r-full",
                          ai ? "before:bg-violet-500" : "before:bg-teal-500",
                        )
                      : "text-foreground/90 hover:translate-x-0.5 hover:bg-white/90 hover:shadow-sm",
                    compact && "justify-center gap-0 px-2 py-2.5 before:hidden",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                      active
                        ? ai
                          ? "bg-violet-500/12 text-violet-600"
                          : "bg-teal-500/12 text-teal-600"
                        : "bg-teal-500/10 text-teal-700/80 group-hover:bg-white group-hover:text-teal-800",
                    )}
                  >
                    <Icon className="size-[1.15rem] stroke-[1.85]" aria-hidden />
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 truncate font-semibold leading-snug",
                      compact && "sr-only",
                    )}
                  >
                    {label}
                  </span>
                </Link>
              </SidebarNavTooltip>
            );
          })}
        </nav>

        <div className="mt-auto shrink-0 px-3 pb-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "h-auto min-h-[2.75rem] w-full justify-start gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200 hover:bg-red-50 hover:text-red-700 hover:shadow-sm",
              compact && "justify-center px-2",
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10">
              <LogOut className="size-[1.15rem] text-muted-foreground" aria-hidden />
            </span>
            <span className={cn("text-sm font-semibold", compact && "sr-only")}>
              Log out
            </span>
          </Button>
        </div>
      </aside>

      <div className="relative z-0 flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-14 min-w-0 shrink-0 items-center gap-2 border-b border-border/40 bg-background/90 px-2 py-1.5 backdrop-blur-md supports-[backdrop-filter]:bg-background/75 sm:gap-3 sm:px-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 touch-manipulation rounded-xl lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <LayoutList className="size-5" />
          </Button>
          {showNavbarBrand ? (
            <BrandLogoLink
              href="/me"
              size="nav"
              className="min-w-0 max-w-[min(100%,200px)] shrink-0 [&_.brand-logo-mark]:text-base sm:[&_.brand-logo-mark]:text-lg"
              caption={
                <span className="truncate text-[11px] font-medium leading-tight text-muted-foreground/85 lg:sr-only">
                  Train · book · track
                </span>
              }
            />
          ) : null}
          <div className="min-h-9 min-w-0 flex-1" aria-hidden />
          <ClientNotifications />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10 shrink-0 touch-manipulation rounded-full ring-2 ring-teal-500/15"
                aria-label="Account menu"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-teal-500/10 text-xs font-bold text-teal-800">
                    {initials(user?.name ?? "U")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-0.5">
                  <span className="text-sm font-semibold">{user?.name}</span>
                  <span className="text-xs font-medium text-muted-foreground/85">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/me/profile" className="flex cursor-pointer items-center gap-2">
                  <User className="size-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                <LogOut className="size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto w-full min-w-0 max-w-6xl px-3 py-5 min-[400px]:px-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <BookingsProvider>{children}</BookingsProvider>
          </div>
        </main>
      </div>
    </div>
  );
}
