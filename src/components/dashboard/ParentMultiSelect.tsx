"use client";

import { Check, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/format";
import type { ParentProfile } from "@/lib/types";

const relLabel = {
  mother: "Ibu",
  father: "Ayah",
  guardian: "Wali",
} as const;

interface ParentMultiSelectProps {
  parents: ParentProfile[];
  value: string[];
  onChange: (ids: string[]) => void;
  required?: boolean;
  placeholder?: string;
  max?: number;
}

export function ParentMultiSelect({
  parents,
  value,
  onChange,
  required,
  placeholder = "Cari & pilih orang tua…",
  max = 4,
}: ParentMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () =>
      value
        .map((id) => parents.find((p) => p.id === id))
        .filter((p): p is ParentProfile => Boolean(p)),
    [parents, value],
  );

  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    return parents.filter((p) => {
      if (value.includes(p.id)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q)
      );
    });
  }, [parents, value, query]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function add(id: string) {
    if (value.includes(id) || value.length >= max) return;
    onChange([...value, id]);
    setQuery("");
    setOpen(false);
  }

  function remove(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  return (
    <div ref={rootRef} className="space-y-2">
      {required ? (
        <input
          tabIndex={-1}
          className="sr-only"
          value={value[0] ?? ""}
          required={required}
          onChange={() => {}}
          aria-hidden
        />
      ) : null}

      {selected.length > 0 ? (
        <ul className="space-y-2">
          {selected.map((p) => (
            <li
              key={p.id}
              className="flex items-start justify-between gap-2 rounded-xl border border-[#E5ECF5] bg-[#F7FAFD] px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#1A2330]">
                  {p.name}
                </p>
                <p className="truncate text-xs text-[#8A96A8]">
                  {relLabel[p.relationship]} · {p.phone} · {p.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="shrink-0 rounded-lg p-1 text-[#8A96A8] hover:bg-white hover:text-rose-600"
                aria-label={`Hapus ${p.name}`}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {value.length < max ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setOpen((v) => !v);
              setQuery("");
            }}
            className="flex w-full items-center gap-2 rounded-xl border border-dashed border-[#D5DEEA] bg-white px-3 py-2.5 text-left text-sm text-[#5B6B7C] outline-none hover:border-[#2E7DFF]/40 hover:bg-[#F7FAFD] focus:border-[#2E7DFF]/50 focus:ring-2 focus:ring-[#2E7DFF]/15"
          >
            <Plus className="size-4 shrink-0 text-[#2E7DFF]" />
            <span className="min-w-0 flex-1 truncate">
              {selected.length === 0 ? placeholder : "Tambah orang tua / wali lain"}
            </span>
            <Search className="size-4 shrink-0 text-[#A0AAB8]" />
          </button>

          {open ? (
            <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-xl border border-[#E5ECF5] bg-white shadow-lg">
              <div className="border-b border-[#EEF3FA] p-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#A0AAB8]" />
                  <input
                    autoFocus
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ketik nama, HP, atau email…"
                    className="w-full rounded-lg border border-[#E5ECF5] bg-[#F7FAFD] py-1.5 pl-8 pr-2 text-sm outline-none focus:border-[#2E7DFF]/40"
                  />
                </div>
              </div>
              <ul className="max-h-52 overflow-y-auto py-1">
                {available.slice(0, 12).map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => add(p.id)}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#F3F7FC]",
                      )}
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2E7DFF]/15 text-[10px] font-bold text-[#2E7DFF]">
                        {p.name.slice(0, 1)}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        <span className="font-medium">{p.name}</span>
                        <span className="block text-xs text-[#8A96A8]">
                          {relLabel[p.relationship]} · {p.phone}
                        </span>
                      </span>
                      <Check className="size-4 text-transparent" />
                    </button>
                  </li>
                ))}
                {available.length === 0 ? (
                  <li className="px-3 py-6 text-center text-sm text-[#8A96A8]">
                    Tidak ada orang tua tersedia
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-[#8A96A8]">Maksimal {max} orang tua / wali</p>
      )}
    </div>
  );
}
