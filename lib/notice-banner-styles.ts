import { cn } from "@/lib/utils";

export const noticeBannerBg = "bg-[rgb(254,226,226)]";

export const warningNoticeStyles = {
  root: cn(
    "rounded-xl border shadow-sm",
    "border-amber-300 bg-amber-50",
    "dark:border-amber-600 dark:bg-amber-950",
  ),
  title: cn("font-semibold text-amber-950", "dark:text-amber-50"),
  body: cn("leading-relaxed text-amber-900", "dark:text-amber-100"),
  iconWrap: cn(
    "flex shrink-0 items-center justify-center rounded-lg",
    "bg-amber-200 text-amber-950",
    "dark:bg-amber-800 dark:text-amber-50",
  ),
} as const;

export const orangeNoticeStyles = {
  root: cn(
    "rounded-xl border shadow-sm",
    "border-orange-300 bg-orange-50",
    "dark:border-orange-600 dark:bg-orange-950",
  ),
  title: cn("font-semibold text-orange-950", "dark:text-orange-50"),
  body: cn("leading-relaxed text-orange-900", "dark:text-orange-100"),
} as const;

export const warningNotificationRing = cn(
  "border-amber-300 bg-amber-50 text-amber-950",
  "dark:border-amber-600 dark:bg-amber-950 dark:text-amber-50",
);

export const warningStatusChip = cn(
  "border-amber-300 bg-amber-50 text-amber-950",
  "dark:border-amber-600 dark:bg-amber-950 dark:text-amber-50",
);

export const alertNoticeStyles = {
  root: cn(
    "rounded-xl border border-red-200/80 shadow-sm",
    noticeBannerBg,
    "text-black",
  ),
  title: "font-bold text-black",
  body: "leading-relaxed text-black/90",
  iconWrap: cn(
    "flex shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-sm",
  ),
} as const;
