import { ShieldAlert } from "lucide-react";
import { CLIENT_AI_DAILY_MESSAGE_LIMIT } from "@/lib/ai-constants";
import { alertNoticeStyles } from "@/lib/notice-banner-styles";
import { cn } from "@/lib/utils";

type AiDailyLimitBannerProps = {
  limit?: number;
  className?: string;
  compact?: boolean;
};

export function AiDailyLimitBanner({
  limit = CLIENT_AI_DAILY_MESSAGE_LIMIT,
  className,
  compact = false,
}: AiDailyLimitBannerProps) {
  return (
    <div
      role="status"
      className={cn(
        alertNoticeStyles.root,
        "flex items-start gap-3",
        compact ? "px-3 py-2.5" : "px-4 py-3",
        className,
      )}
    >
      <span
        className={cn(alertNoticeStyles.iconWrap, compact ? "size-8" : "size-9")}
        aria-hidden
      >
        <ShieldAlert className="size-4" strokeWidth={2.25} />
      </span>
      <div className="min-w-0 space-y-0.5 text-black">
        <p className={cn(alertNoticeStyles.title, compact ? "text-xs" : "text-sm")}>
          Daily AI limit reached
        </p>
        <p className={cn(alertNoticeStyles.body, compact ? "text-[11px]" : "text-xs")}>
          You have used all <strong className="font-semibold text-black">{limit}</strong> FitBook
          AI messages for today. New messages unlock tomorrow (UTC).
        </p>
      </div>
    </div>
  );
}
