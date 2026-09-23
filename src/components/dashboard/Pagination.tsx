"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/format";

export const DEFAULT_PAGE_SIZE = 10;

export function usePagination<T>(items: T[], pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const firstId =
    items.length > 0 && items[0] && typeof items[0] === "object" && "id" in items[0]
      ? String((items[0] as { id: string }).id)
      : String(total);
  const resetKey = `${total}:${firstId}:${pageSize}`;

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return {
    page,
    setPage,
    pageSize,
    total,
    totalPages,
    pageItems,
    from: total === 0 ? 0 : (page - 1) * pageSize + 1,
    to: Math.min(page * pageSize, total),
  };
}

export function Pagination({
  page,
  totalPages,
  total,
  from,
  to,
  onPageChange,
  className,
}: {
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (total === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-xs text-[#8A96A8]">
        Menampilkan{" "}
        <span className="font-medium text-[#5B6B7C]">
          {from}–{to}
        </span>{" "}
        dari <span className="font-medium text-[#5B6B7C]">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-[#E5ECF5] bg-white px-3 py-1.5 text-xs font-medium",
            page <= 1
              ? "cursor-not-allowed text-[#C5CDD8]"
              : "text-[#5B6B7C] hover:bg-[#F3F7FC]",
          )}
        >
          <ChevronLeft className="size-3.5" />
          Prev
        </button>
        <span className="min-w-[4.5rem] text-center text-xs tabular-nums text-[#5B6B7C]">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-[#E5ECF5] bg-white px-3 py-1.5 text-xs font-medium",
            page >= totalPages
              ? "cursor-not-allowed text-[#C5CDD8]"
              : "text-[#5B6B7C] hover:bg-[#F3F7FC]",
          )}
        >
          Next
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
