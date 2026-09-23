"use client";

import { Check, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/format";
import type { Teacher } from "@/lib/types";

const roleLabel: Record<Teacher["role"], string> = {
  teacher: "Guru",
  admin: "Admin",
  owner: "Pemilik",
};

interface TeacherSearchSelectProps {
  teachers: Teacher[];
  value: string;
  onChange: (teacherId: string) => void;
  name?: string;
  required?: boolean;
  placeholder?: string;
  /** Limit to classroom teachers + admin by default */
  roles?: Teacher["role"][];
}

export function TeacherSearchSelect({
  teachers,
  value,
  onChange,
  name = "teacherId",
  required,
  placeholder = "Cari guru…",
  roles = ["teacher", "admin", "owner"],
}: TeacherSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const pool = useMemo(
    () => teachers.filter((t) => roles.includes(t.role)),
    [teachers, roles],
  );

  const selected = pool.find((t) => t.id === value) ?? teachers.find((t) => t.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.phone.toLowerCase().includes(q),
    );
  }, [pool, query]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} required={required} />
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setQuery("");
        }}
        className="flex w-full items-center gap-2 rounded-xl border border-[#E5ECF5] bg-[#F7FAFD] px-3 py-2 text-left text-sm text-[#1A2330] outline-none focus:border-[#2E7DFF]/50 focus:ring-2 focus:ring-[#2E7DFF]/15"
      >
        {selected ? (
          <>
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2E7DFF]/15 text-[10px] font-bold text-[#2E7DFF]">
              {selected.name.slice(0, 1)}
            </span>
            <span className="min-w-0 flex-1 truncate">
              <span className="font-medium">{selected.name}</span>
              <span className="text-[#8A96A8]">
                {" "}
                · {roleLabel[selected.role]}
              </span>
            </span>
          </>
        ) : (
          <span className="text-[#A0AAB8]">{placeholder}</span>
        )}
        <Search className="ml-auto size-4 shrink-0 text-[#A0AAB8]" />
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
                placeholder="Ketik nama, email, atau HP…"
                className="w-full rounded-lg border border-[#E5ECF5] bg-[#F7FAFD] py-1.5 pl-8 pr-2 text-sm outline-none focus:border-[#2E7DFF]/40"
              />
            </div>
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(t.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[#F3F7FC]",
                    value === t.id && "bg-[#F3F7FC]",
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2E7DFF]/15 text-[10px] font-bold text-[#2E7DFF]">
                    {t.name.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium">{t.name}</span>
                    <span className="block text-xs text-[#8A96A8]">
                      {roleLabel[t.role]} · {t.phone}
                    </span>
                  </span>
                  {value === t.id ? (
                    <Check className="size-4 text-[#2E7DFF]" />
                  ) : null}
                </button>
              </li>
            ))}
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-[#8A96A8]">
                Guru tidak ditemukan
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
