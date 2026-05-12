import type { ReactNode } from "react";
import Link from "next/link";
import { BrandLogoLink } from "@/components/site/brand-logo-link";
export function AuthShell({ title, description, children, footer, }: {
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
}) {
    return (<div className="flex min-h-dvh min-w-0 flex-col bg-muted/30 px-[max(1rem,env(safe-area-inset-left))] py-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] min-[400px]:px-6 sm:py-10">
      <div className="mx-auto w-full min-w-0 max-w-[400px] flex-1 space-y-6 py-4 sm:space-y-8 sm:py-6">
        <div className="text-center">
          <Link href="/" className="inline-block text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            ← Back to home
          </Link>
        </div>
        <div className="space-y-2 text-center">
          <BrandLogoLink href="/" size="nav" className="mx-auto block max-w-[min(100%,280px)] [&_.brand-logo-mark]:text-2xl sm:[&_.brand-logo-mark]:text-3xl"/>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">{children}</div>
        {footer ? <div className="text-center text-sm text-muted-foreground">{footer}</div> : null}
      </div>
    </div>);
}
