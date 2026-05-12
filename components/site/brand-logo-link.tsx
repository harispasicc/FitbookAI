import type { ReactNode } from "react";
import Link from "next/link";
import { FITBOOK_BRAND_INK, FITBOOK_BRAND_TEAL } from "@/components/brand/fitbook-mark";
import { cn } from "@/lib/utils";
export const BRAND_LOGO_MARK_CLASS = "brand-logo-mark";
type BrandLogoLinkProps = {
    size?: "nav" | "footer";
    className?: string;
    href?: string;
    caption?: ReactNode;
    onClick?: () => void;
    ariaLabel?: string;
};
function defaultAriaLabel(href: string) {
    if (href === "/me")
        return "FitBook AI — my app";
    if (href === "/dashboard")
        return "FitBook AI — coach dashboard";
    return "FitBook AI — home";
}
export function BrandLogoLink({ size = "nav", className, href = "/", caption, onClick, ariaLabel, }: BrandLogoLinkProps) {
    const markClass = size === "footer"
        ? "text-xl font-semibold tracking-[-0.04em] sm:text-2xl md:text-3xl lg:text-[1.75rem]"
        : "text-lg font-semibold tracking-[-0.04em] sm:text-xl lg:text-2xl";
    return (<Link href={href} onClick={onClick} className={cn("inline-flex max-w-full min-w-0 shrink-0 flex-col gap-0.5 touch-manipulation", !caption && "items-start", className)} aria-label={ariaLabel ?? defaultAriaLabel(href)}>
      <span className={cn(BRAND_LOGO_MARK_CLASS, "inline-flex min-w-0 items-baseline whitespace-nowrap leading-none font-sans", markClass)}>
        <span style={{ color: FITBOOK_BRAND_INK }}>FitBook</span>{" "}
        <span style={{ color: FITBOOK_BRAND_TEAL }}>AI</span>
      </span>
      {caption ? <span className="min-w-0">{caption}</span> : null}
    </Link>);
}
