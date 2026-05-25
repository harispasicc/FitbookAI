import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
  compact?: boolean;
  inline?: boolean;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  children,
  compact = false,
  inline = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        inline
          ? "px-2 py-3"
          : cn(
              "rounded-2xl border border-dashed border-border/80 bg-muted/20 shadow-sm",
              compact ? "px-4 py-6" : "px-4 py-8 sm:px-6 sm:py-10",
            ),
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full bg-muted/50",
          compact ? "size-9" : "size-11",
        )}
      >
        <Icon
          className={cn("text-primary/80", compact ? "size-4" : "size-5")}
          aria-hidden
        />
      </div>
      <p
        className={cn(
          "mt-3 font-medium text-foreground",
          compact ? "text-sm" : "text-sm sm:text-base",
        )}
      >
        {title}
      </p>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {children ? (
        <div className="mt-4 flex w-full max-w-xs flex-col items-stretch gap-2 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
          {children}
        </div>
      ) : null}
    </div>
  );
}
