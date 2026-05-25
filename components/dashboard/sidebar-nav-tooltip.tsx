"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { deferEffect } from "@/lib/defer-effect";
import { cn } from "@/lib/utils";

export function SidebarNavTooltip({
  label,
  sub,
  show,
  children,
}: {
  label: string;
  sub?: string;
  show: boolean;
  children: ReactNode;
}) {
  const tipId = useId();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    deferEffect(() => setMounted(true));
  }, []);

  const updatePosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({
      top: rect.top + rect.height / 2,
      left: rect.right + 8,
    });
  }, []);

  const showTip = useCallback(() => {
    if (!show) return;
    updatePosition();
    setOpen(true);
  }, [show, updatePosition]);

  const hideTip = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open || !show) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, show, updatePosition]);

  if (!show) {
    return <>{children}</>;
  }

  const tooltip =
    mounted && open ? (
      <span
        id={tipId}
        role="tooltip"
        style={{
          position: "fixed",
          top: coords.top,
          left: coords.left,
          transform: "translateY(-50%)",
        }}
        className={cn(
          "pointer-events-none z-[200] whitespace-nowrap rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white shadow-xl",
        )}
      >
        {label}
        {sub ? (
          <span className="ml-1.5 font-medium text-zinc-400">{sub}</span>
        ) : null}
        <span
          className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-zinc-900"
          aria-hidden
        />
      </span>
    ) : null;

  return (
    <>
      <div
        ref={anchorRef}
        className="relative flex w-full justify-center"
        onMouseEnter={showTip}
        onMouseLeave={hideTip}
        onFocus={showTip}
        onBlur={hideTip}
      >
        {children}
      </div>
      {mounted && tooltip ? createPortal(tooltip, document.body) : null}
    </>
  );
}
