"use client";

import { useMemo, useState } from "react";
import { FilterSelect } from "@/components/dashboard/SearchFilterBar";
import { formatIDR, formatMonth } from "@/lib/format";
import { financeSummaries } from "@/lib/mock-data";

const MONTH_OPTS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export default function FinancePage() {
  const years = Array.from(
    new Set(financeSummaries.map((f) => f.month.slice(0, 4))),
  ).sort()
    .reverse();

  const [year, setYear] = useState(years[0] ?? "2026");
  const [monthNum, setMonthNum] = useState(
    financeSummaries[0]?.month.slice(5, 7) ?? "07",
  );

  const monthKey = `${year}-${monthNum}`;

  const summary = useMemo(
    () => financeSummaries.find((f) => f.month === monthKey),
    [monthKey],
  );

  const yearSummaries = useMemo(
    () => financeSummaries.filter((f) => f.month.startsWith(year)),
    [year],
  );

  const availableMonths = useMemo(() => {
    const set = new Set(
      financeSummaries
        .filter((f) => f.month.startsWith(year))
        .map((f) => f.month.slice(5, 7)),
    );
    return MONTH_OPTS.filter((m) => set.has(m.value));
  }, [year]);

  function onYearChange(y: string) {
    setYear(y);
    const monthsForYear = financeSummaries
      .filter((f) => f.month.startsWith(y))
      .map((f) => f.month.slice(5, 7));
    if (!monthsForYear.includes(monthNum)) {
      setMonthNum(monthsForYear[0] ?? "01");
    }
  }

  const net = summary
    ? summary.tuitionCollected + summary.eventFees - summary.expenses
    : 0;

  const rows = summary
    ? [
        { label: "Tuition collected", value: summary.tuitionCollected },
        { label: "Tuition pending", value: summary.tuitionPending },
        { label: "Event fees", value: summary.eventFees },
        { label: "Expenses", value: -summary.expenses },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Finance report</h1>
          <p className="mt-1 text-sm text-neutral-500">Monthly income and expenses</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            label="Year"
            value={year}
            onChange={onYearChange}
            options={years.map((y) => ({ value: y, label: y }))}
          />
          <FilterSelect
            label="Month"
            value={monthNum}
            onChange={setMonthNum}
            options={availableMonths.length ? availableMonths : MONTH_OPTS}
          />
        </div>
      </div>

      {!summary ? (
        <div className="rounded-md border border-dashed border-neutral-200 px-4 py-12 text-center text-sm text-neutral-500">
          No finance data for {MONTH_OPTS.find((m) => m.value === monthNum)?.label} {year}.
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Net · {formatMonth(monthKey)}
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{formatIDR(net)}</p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Inflow</p>
              <p className="mt-2 text-xl font-semibold tabular-nums">
                {formatIDR(summary.tuitionCollected + summary.eventFees)}
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Outflow</p>
              <p className="mt-2 text-xl font-semibold tabular-nums">
                {formatIDR(summary.expenses)}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {rows.map((r) => (
                  <tr key={r.label}>
                    <td className="px-4 py-3">{r.label}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                      {formatIDR(r.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold">Trend · {year}</h2>
        <div className="mt-4 flex items-end gap-3">
          {yearSummaries
            .slice()
            .sort((a, b) => a.month.localeCompare(b.month))
            .map((f) => {
              const height = Math.max(12, (f.tuitionCollected / 20000000) * 120);
              const active = f.month === monthKey;
              return (
                <button
                  key={f.month}
                  type="button"
                  onClick={() => setMonthNum(f.month.slice(5, 7))}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div
                    className={`w-full max-w-[48px] rounded-t ${active ? "bg-neutral-900" : "bg-neutral-300"}`}
                    style={{ height }}
                    title={formatIDR(f.tuitionCollected)}
                  />
                  <span className="text-[10px] text-neutral-500">{f.month.slice(5)}</span>
                </button>
              );
            })}
          {yearSummaries.length === 0 ? (
            <p className="w-full text-center text-sm text-neutral-500">No data for this year</p>
          ) : null}
        </div>
        <p className="mt-3 text-xs text-neutral-500">Bars show tuition collected · click to select month</p>
      </section>
    </div>
  );
}
