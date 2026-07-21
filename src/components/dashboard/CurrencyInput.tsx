"use client";

import { useEffect, useState } from "react";
import { inputClass } from "@/components/dashboard/Modal";
import { cn } from "@/lib/format";

interface CurrencyInputProps {
  name?: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

/** IDR-style currency input (displays with thousand separators). */
export function CurrencyInput({
  name = "amount",
  value,
  onChange,
  required,
  className,
  placeholder = "0",
}: CurrencyInputProps) {
  const [display, setDisplay] = useState(() => formatNumber(value));

  useEffect(() => {
    setDisplay(formatNumber(value));
  }, [value]);

  return (
    <>
      <input type="hidden" name={name} value={value || ""} required={required} />
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
          Rp
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={display}
          placeholder={placeholder}
          required={required && value <= 0}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "");
            const next = digits ? Number(digits) : 0;
            setDisplay(formatNumber(next));
            onChange(next);
          }}
          className={cn(inputClass, "pl-9 tabular-nums", className)}
        />
      </div>
    </>
  );
}

function formatNumber(n: number): string {
  if (!n) return "";
  return new Intl.NumberFormat("id-ID").format(n);
}
