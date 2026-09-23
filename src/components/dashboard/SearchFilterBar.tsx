"use client";

import { Search } from "lucide-react";
import { Select } from "@/components/dashboard/Select";

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

export function SearchFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  children,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full min-w-0 lg:max-w-xs">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#A0AAB8]"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-xl border border-[#E5ECF5] bg-white py-2 pl-9 pr-3 text-sm text-[#1A2330] outline-none transition placeholder:text-[#A0AAB8] focus:border-[#2E7DFF]/40 focus:ring-2 focus:ring-[#2E7DFF]/15"
        />
      </div>
      {children ? (
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
          {children}
        </div>
      ) : null}
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: FilterSelectProps) {
  return (
    <label className="flex min-w-0 flex-1 items-center gap-2 text-sm text-[#8A96A8] sm:flex-none">
      <span className="shrink-0 whitespace-nowrap">{label}</span>
      <Select
        compact
        align="right"
        value={value}
        onChange={onChange}
        options={options}
        className="min-w-0 flex-1 sm:flex-none"
      />
    </label>
  );
}

export function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
  const tones = {
    neutral: "bg-[#EEF3FA] text-[#5B6B7C]",
    success: "bg-emerald-500/15 text-emerald-700",
    warning: "bg-amber-500/15 text-amber-800",
    danger: "bg-rose-500/15 text-rose-700",
    info: "bg-sky-500/15 text-sky-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#D5E0EE] bg-white px-4 py-12 text-center text-sm text-[#8A96A8]">
      {message}
    </div>
  );
}
