"use client";

import { Search, Check } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/format";
import type { Student } from "@/lib/types";

interface StudentSearchSelectProps {
  students: Student[];
  value: string;
  onChange: (studentId: string) => void;
  name?: string;
  required?: boolean;
  placeholder?: string;
  label?: string;
}

export function StudentSearchSelect({
  students,
  value,
  onChange,
  name = "studentId",
  required,
  placeholder = "Search student…",
}: StudentSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = students.find((s) => s.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.nickname.toLowerCase().includes(q),
    );
  }, [students, query]);

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
        className="flex w-full items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-left text-sm outline-none focus:border-neutral-400"
      >
        {selected ? (
          <>
            <span
              className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: selected.photoColor }}
            >
              {selected.nickname.slice(0, 1)}
            </span>
            <span className="min-w-0 flex-1 truncate">
              <span className="font-medium">{selected.name}</span>
              <span className="text-neutral-400"> · {selected.nickname}</span>
            </span>
          </>
        ) : (
          <span className="text-neutral-400">{placeholder}</span>
        )}
        <Search className="ml-auto size-4 shrink-0 text-neutral-400" />
      </button>

      {open ? (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg">
          <div className="border-b border-neutral-100 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type name…"
                className="w-full rounded-md border border-neutral-200 py-1.5 pl-8 pr-2 text-sm outline-none focus:border-neutral-400"
              />
            </div>
          </div>
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(s.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-50",
                    value === s.id && "bg-neutral-50",
                  )}
                >
                  <span
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: s.photoColor }}
                  >
                    {s.nickname.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium">{s.name}</span>
                    <span className="block text-xs text-neutral-500">
                      {s.nickname}
                    </span>
                  </span>
                  {value === s.id ? (
                    <Check className="size-4 text-neutral-900" />
                  ) : null}
                </button>
              </li>
            ))}
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-neutral-500">
                No students found
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
