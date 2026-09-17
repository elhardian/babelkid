"use client";

import Link from "next/link";
import { useKas } from "@/components/dashboard/KasProvider";
import { formatIDR } from "@/lib/format";

export function KasOverviewCards() {
  const { balances } = useKas();

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: "Kas cash", value: balances.cash },
        { label: "Kas bank", value: balances.bank },
        { label: "Kas total", value: balances.total },
      ].map((item) => (
        <Link
          key={item.label}
          href="/dashboard/kas"
          className="rounded-xl border border-[#E5ECF5] bg-white p-3 transition hover:border-[#D5E0EE] sm:p-4"
        >
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#8A96A8] sm:text-xs">
            {item.label}
          </p>
          <p className="mt-1 truncate text-sm font-semibold tabular-nums text-[#1A2330] sm:mt-2 sm:text-xl">
            {formatIDR(item.value)}
          </p>
        </Link>
      ))}
    </div>
  );
}
