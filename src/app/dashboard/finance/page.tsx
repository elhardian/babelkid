"use client";

import { useEffect, useMemo, useState } from "react";
import { FilterSelect } from "@/components/dashboard/SearchFilterBar";
import { fetchFinanceSummaries } from "@/app/actions/school-data";
import { formatIDR, formatMonth } from "@/lib/format";
import type { FinanceSummary } from "@/lib/types";

const MONTH_OPTS = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export default function FinancePage() {
  const [summaries, setSummaries] = useState<FinanceSummary[]>([]);

  useEffect(() => {
    void fetchFinanceSummaries().then(setSummaries);
  }, []);

  const years = Array.from(
    new Set(summaries.map((f) => f.month.slice(0, 4))),
  )
    .sort()
    .reverse();

  const [year, setYear] = useState("2026");
  const [monthNum, setMonthNum] = useState("07");

  useEffect(() => {
    if (summaries[0]) {
      setYear(summaries[0].month.slice(0, 4));
      setMonthNum(summaries[0].month.slice(5, 7));
    }
  }, [summaries]);

  const monthKey = `${year}-${monthNum}`;

  const summary = useMemo(
    () => summaries.find((f) => f.month === monthKey),
    [monthKey, summaries],
  );

  const yearSummaries = useMemo(
    () => summaries.filter((f) => f.month.startsWith(year)),
    [year, summaries],
  );

  const availableMonths = useMemo(() => {
    const set = new Set(
      summaries
        .filter((f) => f.month.startsWith(year))
        .map((f) => f.month.slice(5, 7)),
    );
    return MONTH_OPTS.filter((m) => set.has(m.value) || set.size === 0);
  }, [year, summaries]);

  const yearTotals = useMemo(() => {
    return yearSummaries.reduce(
      (acc, s) => ({
        tuitionCollected: acc.tuitionCollected + s.tuitionCollected,
        tuitionPending: acc.tuitionPending + s.tuitionPending,
        eventFees: acc.eventFees + s.eventFees,
        expenses: acc.expenses + s.expenses,
      }),
      {
        tuitionCollected: 0,
        tuitionPending: 0,
        eventFees: 0,
        expenses: 0,
      },
    );
  }, [yearSummaries]);

  const net =
    (summary?.tuitionCollected ?? 0) +
    (summary?.eventFees ?? 0) -
    (summary?.expenses ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Keuangan</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Ringkasan dari SPP & kas (MySQL)
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <FilterSelect
          label="Tahun"
          value={year}
          onChange={setYear}
          options={
            years.length
              ? years.map((y) => ({ value: y, label: y }))
              : [{ value: year, label: year }]
          }
        />
        <FilterSelect
          label="Bulan"
          value={monthNum}
          onChange={setMonthNum}
          options={availableMonths}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "SPP terkumpul",
            value: summary?.tuitionCollected ?? 0,
          },
          {
            label: "SPP tertunggak",
            value: summary?.tuitionPending ?? 0,
          },
          { label: "Biaya acara", value: summary?.eventFees ?? 0 },
          { label: "Pengeluaran", value: summary?.expenses ?? 0 },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-sm"
          >
            <p className="text-xs uppercase tracking-wide text-[#8A96A8]">
              {card.label}
            </p>
            <p className="mt-2 text-xl font-semibold text-[#1A2330]">
              {formatIDR(card.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-sm">
        <p className="text-sm text-[#8A96A8]">
          Neto {formatMonth(monthKey)}
        </p>
        <p className="mt-1 text-2xl font-semibold text-[#1A2330]">
          {formatIDR(net)}
        </p>
      </div>

      <div className="rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-sm">
        <h2 className="text-sm font-medium text-[#1A2330]">
          Total tahun {year}
        </h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-2">
            <dt className="text-[#8A96A8]">SPP</dt>
            <dd>{formatIDR(yearTotals.tuitionCollected)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[#8A96A8]">Tertunggak</dt>
            <dd>{formatIDR(yearTotals.tuitionPending)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[#8A96A8]">Acara</dt>
            <dd>{formatIDR(yearTotals.eventFees)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[#8A96A8]">Pengeluaran</dt>
            <dd>{formatIDR(yearTotals.expenses)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
