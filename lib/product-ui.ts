import { cn } from "@/lib/utils";

export const productUi = {
  pageTitle:
    "text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl",
  pageLead: "text-sm leading-relaxed text-muted-foreground sm:text-base",
  sectionTitle: "text-base font-semibold tracking-tight text-foreground",
  sectionLabel:
    "text-xs font-medium uppercase tracking-wide text-muted-foreground",
  card: "rounded-2xl border border-border/80 bg-card shadow-sm",
  cardPadding: "rounded-2xl border border-border/80 bg-card shadow-sm",
  cardInteractive:
    "rounded-2xl border border-border/80 bg-card shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-primary/25 hover:shadow-md",
  panel: "rounded-2xl border border-border/80 bg-card p-4 shadow-sm sm:p-6",
  modalOverlay:
    "fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-4",
  modalPanel:
    "flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl",
  modalHeader: "shrink-0 border-b border-border/60 px-4 py-4 sm:px-5",
  modalTitle: "text-lg font-semibold tracking-tight text-foreground",
  modalDescription: "mt-1 text-sm leading-relaxed text-muted-foreground",
  modalBody: "min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5",
  modalFooter:
    "shrink-0 flex flex-col-reverse gap-2 border-t border-border/60 p-4 sm:flex-row sm:justify-end sm:gap-2 sm:px-5",
  tableShell: "-mx-px overflow-x-auto overscroll-x-contain",
  tableMinWidth: "min-w-[36rem]",
  filterChip:
    "h-9 min-h-9 rounded-full capitalize transition-colors sm:h-8",
  touchTarget: "min-h-11 touch-manipulation sm:min-h-9",
  errorPanel:
    "rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive",
  iconBadge:
    "flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-primary",
} as const;

export function productCard(className?: string) {
  return cn(productUi.card, className);
}

export function productPageHeader(className?: string) {
  return cn("space-y-1", className);
}
