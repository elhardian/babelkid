"use client";

import { Search } from "lucide-react";

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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-md border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-400"
        />
      </div>
      {children ? (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
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
    <label className="flex items-center gap-2 text-sm text-neutral-600">
      <span className="whitespace-nowrap">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-neutral-200 bg-white px-2.5 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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
    neutral: "bg-neutral-100 text-neutral-700",
    success: "bg-neutral-900 text-white",
    warning: "bg-neutral-200 text-neutral-800",
    danger: "bg-neutral-800 text-white",
    info: "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-300",
  };
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${tones[tone]}`}
    >
      {label}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-neutral-200 px-4 py-12 text-center text-sm text-neutral-500">
      {message}
    </div>
  );
}
