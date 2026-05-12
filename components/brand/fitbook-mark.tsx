import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
export const FITBOOK_BRAND_TEAL = "#0E7474";
export const FITBOOK_BRAND_INK = "#111827";
type FitBookMarkProps = Omit<ComponentPropsWithoutRef<"div">, "children">;
type FitBookWordmarkProps = {
    className?: string;
};
export function FitBookMark({ className, ...props }: FitBookMarkProps) {
    return (<div className={cn("flex shrink-0 items-center justify-center rounded-2xl text-sm font-bold leading-none tracking-[-0.06em] text-white shadow-sm ring-1 ring-black/[0.06]", className)} style={{ backgroundColor: FITBOOK_BRAND_TEAL }} {...props}>
      FB
    </div>);
}
export function FitBookWordmark({ className }: FitBookWordmarkProps) {
    return (<span className={cn("inline-flex min-w-0 items-baseline whitespace-nowrap", className)}>
      <span className="font-bold tracking-[-0.02em]" style={{ color: FITBOOK_BRAND_INK }}>
        FitBook
      </span>{" "}
      <span className="font-bold tracking-[-0.02em]" style={{ color: FITBOOK_BRAND_TEAL }}>
        AI
      </span>
    </span>);
}
