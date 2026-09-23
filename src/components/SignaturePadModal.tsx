"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser, X } from "lucide-react";
import { cn } from "@/lib/format";

interface SignaturePadModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
  initialDataUrl?: string;
  title?: string;
}

export function SignaturePadModal({
  open,
  onClose,
  onSave,
  initialDataUrl,
  title = "Tanda tangan",
}: SignaturePadModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const ratio = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = Math.max(220, Math.min(320, Math.round(w * 0.45)));
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#1A2330";
      ctx.lineWidth = 2.25;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (initialDataUrl) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, w, h);
          setEmpty(false);
        };
        img.src = initialDataUrl;
      } else {
        setEmpty(true);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", resize);
      document.body.style.overflow = "";
    };
  }, [open, initialDataUrl]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.setPointerCapture(e.pointerId);
    drawing.current = true;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setEmpty(false);
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = false;
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    setEmpty(true);
  }

  function save() {
    const canvas = canvasRef.current;
    if (!canvas || empty) return;
    onSave(canvas.toDataURL("image/png"));
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#1A2330]/45 backdrop-blur-sm"
        aria-label="Tutup"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-[#E5ECF5] bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#EEF3FA] px-4 py-3">
          <h2 className="text-base font-semibold text-[#1A2330]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#8A96A8] hover:bg-[#F3F7FC]"
            aria-label="Tutup"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-3 p-4">
          <p className="text-xs text-[#8A96A8]">
            Gambar tanda tangan di kotak di bawah dengan jari atau stylus.
          </p>
          <div className="overflow-hidden rounded-xl border border-dashed border-[#D5DEEA] bg-white touch-none">
            <canvas
              ref={canvasRef}
              className="block w-full cursor-crosshair touch-none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#E5ECF5] px-4 py-2.5 text-sm font-medium text-[#5B6B7C]"
            >
              <Eraser className="size-4" />
              Hapus
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full px-4 py-2.5 text-sm text-[#8A96A8] sm:flex-none"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={empty}
                onClick={save}
                className={cn(
                  "flex-1 rounded-full px-4 py-2.5 text-sm font-medium text-white sm:flex-none",
                  empty
                    ? "cursor-not-allowed bg-[#A0AAB8]"
                    : "bg-[#2E7DFF] shadow-sm shadow-[#2E7DFF]/25",
                )}
              >
                Simpan tanda tangan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
