"use client";

import Link from "next/link";
import { useKas } from "@/components/dashboard/KasProvider";
import { formatIDR } from "@/lib/format";

export function KasOverviewCards() {
  const { balances } = useKas();

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Link
        href="/dashboard/kas"
        className="rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-300"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Kas cash
        </p>
        <p className="mt-2 text-xl font-semibold tabular-nums">
          {formatIDR(balances.cash)}
        </p>
      </Link>
      <Link
        href="/dashboard/kas"
        className="rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-300"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Kas bank
        </p>
        <p className="mt-2 text-xl font-semibold tabular-nums">
          {formatIDR(balances.bank)}
        </p>
      </Link>
      <Link
        href="/dashboard/kas"
        className="rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-300"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Kas total
        </p>
        <p className="mt-2 text-xl font-semibold tabular-nums">
          {formatIDR(balances.total)}
        </p>
      </Link>
    </div>
  );
}
