"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/format";

interface SwipeableGalleryProps {
  images: string[];
  alt: string;
  className?: string;
  aspect?: string;
  rounded?: string;
}

export function SwipeableGallery({
  images,
  alt,
  className,
  aspect = "aspect-[4/3]",
  rounded = "rounded-2xl",
}: SwipeableGalleryProps) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({
    active: false,
    startX: 0,
    delta: 0,
  });

  const go = useCallback(
    (i: number) => {
      const next = ((i % images.length) + images.length) % images.length;
      setIndex(next);
    },
    [images.length],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { active: true, startX: e.clientX, delta: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    drag.current.delta = e.clientX - drag.current.startX;
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(calc(-${index * 100}% + ${drag.current.delta}px))`;
    }
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const d = drag.current.delta;
    if (trackRef.current) {
      trackRef.current.style.transform = "";
    }
    if (d < -48) go(index + 1);
    else if (d > 48) go(index - 1);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  if (images.length === 0) return null;

  return (
    <div className={cn("relative overflow-hidden bg-neutral-100", aspect, rounded, className)}>
      <div
        ref={trackRef}
        className="flex h-full touch-pan-y transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {images.map((src, i) => (
          <div key={src + i} className="relative h-full w-full shrink-0">
            <Image
              src={src}
              alt={`${alt} ${i + 1}`}
              fill
              className="pointer-events-none select-none object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {images.length > 1 ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full bg-white/70 shadow transition-all",
                  i === index ? "w-5 bg-white" : "w-1.5",
                )}
              />
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => go(index - 1)}
              className="flex size-8 items-center justify-center rounded-full bg-black/35 text-sm text-white backdrop-blur-sm hover:bg-black/50"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => go(index + 1)}
              className="flex size-8 items-center justify-center rounded-full bg-black/35 text-sm text-white backdrop-blur-sm hover:bg-black/50"
            >
              ›
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
