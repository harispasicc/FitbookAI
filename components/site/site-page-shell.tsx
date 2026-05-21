import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogoLink } from "@/components/site/brand-logo-link";
import { GUEST_NAV_LINKS } from "@/lib/site-nav";
import { cn } from "@/lib/utils";
type SitePageShellProps = {
    title: string;
    children: ReactNode;
    heroImage?: {
        src: string;
        alt: string;
    };
    maxWidth?: "narrow" | "wide";
};
export function SitePageShell({ title, children, heroImage, maxWidth = "narrow" }: SitePageShellProps) {
    return (<div className="min-h-screen min-w-0 bg-background text-foreground">
      <header className="border-b border-border/80">
        <div className="mx-auto flex min-h-[5.25rem] max-w-6xl items-center justify-between gap-3 px-3 py-2 min-[400px]:px-4 sm:min-h-28 sm:px-6 sm:py-3">
          <BrandLogoLink size="nav"/>
          <nav className="flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm font-medium">
            {GUEST_NAV_LINKS.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={cn(
                  item.variant === "primary"
                    ? "rounded-lg bg-primary px-3 py-1.5 text-primary-foreground shadow-sm hover:opacity-90"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className={cn("mx-auto min-w-0 space-y-6 px-3 py-10 min-[400px]:px-4 sm:px-6 sm:py-14", maxWidth === "wide" ? "max-w-4xl" : "max-w-2xl")}>
        {heroImage ? (<div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-sm sm:aspect-[2.4/1]">
            <Image src={heroImage.src} alt={heroImage.alt} fill className="object-cover" sizes="(max-width: 896px) 100vw, 896px" priority/>
          </div>) : null}
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{children}</div>
      </main>
    </div>);
}
