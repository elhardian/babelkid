"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/format";

export type SelectOption = {
  value: string;
  label: string;
  hint?: string;
};

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Filter-bar compact look */
  compact?: boolean;
  /** Align panel to the right (useful in filter bars) */
  align?: "left" | "right";
}

export function Select({
  options,
  value,
  onChange,
  name,
  required,
  placeholder = "Pilih…",
  disabled,
  className,
  compact,
  align = "left",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {name ? (
        <input type="hidden" name={name} value={value} required={required} />
      ) : null}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
        }}
        className={cn(
          "flex w-full items-center gap-2 text-left text-sm outline-none transition",
          compact
            ? "min-w-[7.5rem] rounded-xl border border-[#E5ECF5] bg-white px-2.5 py-2 text-[#1A2330] focus:border-[#2E7DFF]/40 focus:ring-2 focus:ring-[#2E7DFF]/15"
            : "rounded-xl border border-[#E5ECF5] bg-[#F7FAFD] px-3 py-2 text-[#1A2330] focus:border-[#2E7DFF]/50 focus:ring-2 focus:ring-[#2E7DFF]/15",
          open && "border-[#2E7DFF]/40 ring-2 ring-[#2E7DFF]/15",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span
          className={cn(
            "min-w-0 flex-1 truncate",
            selected ? "font-medium text-[#1A2330]" : "text-[#A0AAB8]",
          )}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-[#A0AAB8] transition",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className={cn(
            "absolute z-40 mt-1 max-h-56 min-w-full overflow-y-auto rounded-xl border border-[#E5ECF5] bg-white py-1 shadow-lg",
            align === "right" ? "right-0" : "left-0",
            compact ? "w-max" : "w-full",
          )}
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#F3F7FC]",
                    active && "bg-[#F3F7FC]",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-[#1A2330]">
                      {opt.label}
                    </span>
                    {opt.hint ? (
                      <span className="block truncate text-xs text-[#8A96A8]">
                        {opt.hint}
                      </span>
                    ) : null}
                  </span>
                  {active ? (
                    <Check className="size-4 shrink-0 text-[#2E7DFF]" />
                  ) : null}
                </button>
              </li>
            );
          })}
          {options.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-[#8A96A8]">
              Tidak ada pilihan
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
