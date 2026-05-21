"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarPlus, LogOut, Menu, User } from "lucide-react";
import { DashboardNotifications } from "@/components/dashboard/dashboard-notifications";
import { DashboardSearch } from "@/components/dashboard/dashboard-search";
import { useAuth } from "@/contexts/auth-context";
import { BrandLogoLink } from "@/components/site/brand-logo-link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
function initials(name: string) {
    return name
        .split(/\s+/)
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}
export function DashboardTopBar({ onMenuClick, showBrandInNavbar, }: {
    onMenuClick: () => void;
    showBrandInNavbar: boolean;
}) {
    const router = useRouter();
    const { user, logout } = useAuth();
    function handleLogout() {
        void logout().then(() => router.replace("/"));
    }
    return (<header className="sticky top-0 z-30 flex min-h-14 min-w-0 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-2 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:gap-3 sm:px-3 sm:py-0 md:gap-4 md:px-4">
      <Button type="button" variant="ghost" size="icon" className="size-10 shrink-0 touch-manipulation lg:hidden" onClick={onMenuClick} aria-label="Open navigation">
        <Menu className="size-5"/>
      </Button>

      {showBrandInNavbar ? (<BrandLogoLink href="/dashboard" size="nav" className="min-w-0 max-w-[min(100%,200px)] shrink-0 [&_.brand-logo-mark]:text-base sm:[&_.brand-logo-mark]:text-lg lg:[&_.brand-logo-mark]:text-lg"/>) : null}

      <DashboardSearch />

      <DashboardNotifications />

      <Button asChild size="icon" variant="ghost" className="shrink-0 touch-manipulation sm:hidden" title="Calendar">
        <Link href="/calendar" aria-label="Calendar">
          <CalendarPlus className="size-5 text-muted-foreground"/>
        </Link>
      </Button>

      <Button asChild size="sm" variant="outline" className="hidden shrink-0 rounded-lg sm:inline-flex">
        <Link href="/calendar">Calendar</Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-10 shrink-0 touch-manipulation rounded-full" aria-label="Account menu">
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
            <Link href="/profile" className="flex cursor-pointer items-center gap-2">
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
    </header>);
}
