import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "gap-0.5 [&_span]:size-1",
  md: "gap-1 [&_span]:size-1.5",
  lg: "gap-1.5 [&_span]:size-2",
} as const;

type BusyDotsProps = {
  className?: string;
  size?: keyof typeof sizeClasses;
  /** Screen-reader only; no visible label is rendered. */
  label?: string;
};

export function BusyDots({ className, size = "md", label = "Loading" }: BusyDotsProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn("inline-flex items-center", className)}
    >
      <span className="sr-only">{label}</span>
      <span className={cn("inline-flex items-center", sizeClasses[size])}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="rounded-full bg-primary/80 animate-bounce"
            style={{ animationDelay: `${i * 0.12}s`, animationDuration: "0.55s" }}
          />
        ))}
      </span>
    </div>
  );
}

type LoadingPlaceholderProps = {
  className?: string;
  size?: keyof typeof sizeClasses;
  minHeight?: string;
};

export function LoadingPlaceholder({
  className,
  size = "md",
  minHeight = "min-h-[8rem]",
}: LoadingPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/15",
        minHeight,
        className,
      )}
    >
      <BusyDots size={size} />
    </div>
  );
}
