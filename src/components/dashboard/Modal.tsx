"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}

export function Modal({ open, onClose, title, children, wide }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#1A2330]/45 backdrop-blur-sm"
        aria-label="Tutup dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative z-10 flex max-h-[min(92dvh,92vh)] w-full flex-col overflow-hidden rounded-t-2xl border border-[#E5ECF5] bg-white shadow-xl sm:rounded-2xl ${
          wide ? "sm:max-w-2xl" : "sm:max-w-lg"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#EEF3FA] bg-white px-4 py-3">
          <h2 id="modal-title" className="pr-2 text-base font-semibold text-[#1A2330]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-[#8A96A8] hover:bg-[#F3F7FC] hover:text-[#1A2330]"
            aria-label="Tutup"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-[#1A2330]">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="text-[#8A96A8]">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-[#E5ECF5] bg-[#F7FAFD] px-3 py-2 text-sm text-[#1A2330] outline-none placeholder:text-[#A0AAB8] focus:border-[#2E7DFF]/50 focus:ring-2 focus:ring-[#2E7DFF]/15";

export function ModalActions({
  onCancel,
  submitLabel = "Simpan",
}: {
  onCancel: () => void;
  submitLabel?: string;
}) {
  return (
    <div className="mt-4 flex flex-col-reverse gap-2 border-t border-[#EEF3FA] pt-4 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl px-3 py-2.5 text-sm text-[#8A96A8] hover:bg-[#F3F7FC] hover:text-[#1A2330] sm:py-2"
      >
        Batal
      </button>
      <button
        type="submit"
        className="rounded-xl bg-[#2E7DFF] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2568d9] sm:py-2"
      >
        {submitLabel}
      </button>
    </div>
  );
}
