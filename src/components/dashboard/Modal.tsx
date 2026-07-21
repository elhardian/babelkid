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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-xl ${
          wide ? "sm:max-w-2xl" : "sm:max-w-lg"
        }`}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-100 bg-white px-4 py-3">
          <h2 id="modal-title" className="text-base font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
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
      <span className="text-neutral-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-400";

export function ModalActions({
  onCancel,
  submitLabel = "Save",
}: {
  onCancel: () => void;
  submitLabel?: string;
}) {
  return (
    <div className="mt-4 flex justify-end gap-2 border-t border-neutral-100 pt-4">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      >
        {submitLabel}
      </button>
    </div>
  );
}
