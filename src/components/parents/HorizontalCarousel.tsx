"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/lib/format";

interface HorizontalCarouselProps {
  children: React.ReactNode;
  className?: string;
  /** Extra horizontal padding inside the scroll track */
  edgePadding?: boolean;
}

/**
 * Horizontally scrollable strip with touch + mouse drag support.
 */
export function HorizontalCarousel({
  children,
  className,
  edgePadding = true,
}: HorizontalCarouselProps) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    drag.current = {
      active: true,
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      moved: false,
    };
    el.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.scrollLeft - dx;
  }, []);

  const endDrag = useCallback((e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    drag.current.active = false;
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  }, []);

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
      className={cn(
        "flex cursor-grab gap-3 overflow-x-auto overscroll-x-contain scroll-smooth active:cursor-grabbing",
        "snap-x snap-mandatory touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        edgePadding && "-mx-5 px-5",
        className,
      )}
    >
      {children}
    </div>
  );
}
