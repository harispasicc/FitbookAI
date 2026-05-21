"use client";

import type { ReactNode } from "react";
import { productUi } from "@/lib/product-ui";

type ModalShellProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId?: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxHeight?: string;
};

export function ModalShell({
  open,
  onClose,
  title,
  titleId = "modal-title",
  description,
  children,
  footer,
  maxHeight = "min(90dvh,32rem)",
}: ModalShellProps) {
  if (!open) return null;

  return (
    <div
      className={productUi.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className={productUi.modalPanel}
        style={{ maxHeight }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={productUi.modalHeader}>
          <h2 id={titleId} className={productUi.modalTitle}>
            {title}
          </h2>
          {description ? (
            <div className={productUi.modalDescription}>{description}</div>
          ) : null}
        </div>
        <div className={productUi.modalBody}>{children}</div>
        {footer ? <div className={productUi.modalFooter}>{footer}</div> : null}
      </div>
    </div>
  );
}
