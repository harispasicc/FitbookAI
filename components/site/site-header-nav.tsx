"use client";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useId, useState, type ReactNode } from "react";
import { BrandLogoLink } from "@/components/site/brand-logo-link";
import { cn } from "@/lib/utils";
export type SiteHeaderNavLink = {
    href: string;
    label: string;
    variant?: "default" | "primary";
};
type SiteHeaderNavProps = {
    links: SiteHeaderNavLink[];
    mobilePrefix?: SiteHeaderNavLink[];
    trailingSlot?: ReactNode;
    className?: string;
};
function linkClass(variant: SiteHeaderNavLink["variant"], dense: boolean) {
    const base = "touch-manipulation rounded-lg text-sm font-medium transition-colors min-[400px]:px-3";
    if (variant === "primary") {
        return cn(base, dense ? "px-2 py-2" : "px-3 py-3 text-base", "bg-primary text-primary-foreground shadow-sm hover:opacity-90");
    }
    return cn(base, dense ? "px-2 py-2" : "px-3 py-3 text-base", "text-muted-foreground hover:text-foreground");
}
export function SiteHeaderNav({ links, mobilePrefix = [], trailingSlot, className }: SiteHeaderNavProps) {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const panelId = useId();
    useEffect(() => {
        setMounted(true);
    }, []);
    useEffect(() => {
        setOpen(false);
    }, [pathname]);
    useEffect(() => {
        if (!open)
            return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);
    useEffect(() => {
        if (!open)
            return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape")
                setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);
    const mobileItems = [...mobilePrefix, ...links];
    return (<div className={cn("relative flex min-w-0 flex-1 items-center justify-end", className)}>
      <nav className="hidden min-w-0 flex-nowrap items-center justify-end gap-1 md:flex md:gap-2" aria-label="Main">
        {links.map((item) => (<Link key={item.href + item.label} href={item.href} className={linkClass(item.variant, true)}>
            {item.label}
          </Link>))}
        {trailingSlot ? <div className="ml-1 flex shrink-0 items-center">{trailingSlot}</div> : null}
      </nav>

      <button type="button" className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-foreground md:hidden touch-manipulation hover:bg-muted/80" aria-expanded={open} aria-controls={panelId} aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}>
        {open ? <X className="size-6" aria-hidden/> : <Menu className="size-6" aria-hidden/>}
      </button>

      {mounted && open
            ? createPortal(<>
              <button type="button" className="fixed inset-0 z-[200] bg-black/50 md:hidden" aria-label="Close menu" onClick={() => setOpen(false)}/>
              <div id={panelId} className="fixed inset-y-0 right-0 z-[210] flex w-[min(100vw,18rem)] min-h-0 flex-col border-l border-border bg-card text-card-foreground shadow-2xl md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-3 py-2">
                  <div className="min-w-0 flex-1" onClick={() => setOpen(false)} role="presentation">
                    <BrandLogoLink size="nav" className="block max-w-full [&_.brand-logo-mark]:text-base [&_.brand-logo-mark]:sm:text-lg"/>
                  </div>
                  <button type="button" className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg touch-manipulation hover:bg-muted/80" aria-label="Close menu" onClick={() => setOpen(false)}>
                    <X className="size-6" aria-hidden/>
                  </button>
                </div>
                <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3 text-left" aria-label="Mobile">
                  {mobileItems.map((item) => (<Link key={`m-${item.href}-${item.label}`} href={item.href} className={cn(linkClass(item.variant, false), "w-full text-left")} onClick={() => setOpen(false)}>
                      {item.label}
                    </Link>))}
                  {trailingSlot ? (<div className="mt-auto border-t border-border pt-3" onClick={() => setOpen(false)} role="presentation">
                      {trailingSlot}
                    </div>) : null}
                </nav>
              </div>
            </>, document.body)
            : null}
    </div>);
}
