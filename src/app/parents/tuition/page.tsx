"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParentKids } from "@/components/parents/ParentKidsProvider";
import {
  formatDate,
  formatIDR,
  formatMonth,
  paymentMethodLabel,
} from "@/lib/format";
import { tuitionRecords } from "@/lib/mock-data";

export default function ParentsTuitionPage() {
  const { selectedChildId, selectedChild, children, setSelectedChildId } =
    useParentKids();

  const all = useMemo(
    () =>
      tuitionRecords
        .filter((t) => t.studentId === selectedChildId)
        .sort((a, b) => b.month.localeCompare(a.month)),
    [selectedChildId],
  );

  const months = Array.from(new Set(all.map((t) => t.month)));
  const [month, setMonth] = useState("all");

  const filtered =
    month === "all" ? all : all.filter((t) => t.month === month);

  const needsPay = all.find(
    (t) =>
      t.status === "pending" ||
      t.status === "overdue" ||
      t.status === "submitted",
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold">
          Tuition
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Payment history & proof · {selectedChild.nickname}
        </p>
      </div>

      {children.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {children.map((kid) => (
            <button
              key={kid.id}
              type="button"
              onClick={() => {
                setSelectedChildId(kid.id);
                setMonth("all");
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                kid.id === selectedChildId
                  ? "bg-[#00B894] text-white"
                  : "bg-white text-neutral-600 shadow-sm"
              }`}
            >
              {kid.nickname}
            </button>
          ))}
        </div>
      ) : null}

      {needsPay && needsPay.status !== "submitted" ? (
        <Link
          href="/parents/pay"
          className="block rounded-2xl bg-[#00B894] p-4 text-white shadow-md"
        >
          <p className="text-xs text-white/70">
            Due · {formatMonth(needsPay.month)} · {selectedChild.nickname}
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums">
            {formatIDR(needsPay.amount)}
          </p>
          <p className="mt-2 text-sm font-medium text-[#FFF3D1]">
            Submit payment proof →
          </p>
        </Link>
      ) : needsPay?.status === "submitted" ? (
        <div className="rounded-2xl bg-[#FFF3D1] p-4 text-neutral-800">
          <p className="text-sm font-semibold">Proof under review</p>
          <p className="mt-1 text-xs text-neutral-600">
            {formatMonth(needsPay.month)} · {formatIDR(needsPay.amount)}
          </p>
        </div>
      ) : null}

      <div>
        <label className="text-xs font-medium text-neutral-500">
          Filter month
        </label>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="mt-1 w-full rounded-xl border-0 bg-white px-3 py-2.5 text-sm shadow-sm outline-none"
        >
          <option value="all">All months</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {formatMonth(m)}
            </option>
          ))}
        </select>
      </div>

      <ul className="space-y-2">
        {filtered.map((t) => (
          <li key={t.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-neutral-900">
                  {formatMonth(t.month)}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Due {formatDate(t.dueDate)}
                  {t.paidAt ? ` · Paid ${formatDate(t.paidAt)}` : ""}
                  {t.paymentMethod
                    ? ` · ${paymentMethodLabel(t.paymentMethod)}`
                    : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold tabular-nums">
                  {formatIDR(t.amount)}
                </p>
                <p className="mt-0.5 text-xs font-medium capitalize text-neutral-500">
                  {t.status}
                </p>
              </div>
            </div>
            {t.note ? (
              <p className="mt-2 text-xs text-neutral-500">{t.note}</p>
            ) : null}
          </li>
        ))}
        {filtered.length === 0 ? (
          <li className="rounded-2xl bg-white py-10 text-center text-sm text-neutral-500 shadow-sm">
            No tuition records
          </li>
        ) : null}
      </ul>
    </div>
  );
}
