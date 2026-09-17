"use client";

import { Landmark } from "lucide-react";
import { useKas } from "@/components/dashboard/KasProvider";
import { formatIDR } from "@/lib/format";

export function DashboardKasKpis() {
  const { balances } = useKas();

  return (
    <div className="rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-[#8A96A8]">Kas total</p>
        <Landmark className="size-4 text-[#2E7DFF]" />
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-[#1A2330]">
        {formatIDR(balances.total)}
      </p>
      <p className="mt-2 text-xs text-[#8A96A8]">
        Cash {formatIDR(balances.cash)} · Bank {formatIDR(balances.bank)}
      </p>
    </div>
  );
}
