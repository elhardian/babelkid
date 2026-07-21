"use client";

import { useMemo, useState } from "react";
import { useParentKids } from "@/components/parents/ParentKidsProvider";
import { formatDate, formatMonth } from "@/lib/format";
import { presenceRecords } from "@/lib/mock-data";
import type { PresenceStatus } from "@/lib/types";

function tone(status: PresenceStatus) {
  if (status === "present") return "bg-[#00B894] text-white";
  if (status === "absent") return "bg-neutral-800 text-white";
  if (status === "late") return "bg-[#FFD93D] text-neutral-900";
  return "bg-[#54C6EB] text-white";
}

export default function ParentsPresencePage() {
  const { selectedChildId, selectedChild, children, setSelectedChildId } =
    useParentKids();
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");

  const childRecords = useMemo(
    () =>
      presenceRecords
        .filter((p) => p.studentId === selectedChildId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [selectedChildId],
  );

  const monthOptions = useMemo(() => {
    const months = Array.from(
      new Set(childRecords.map((p) => p.date.slice(0, 7))),
    ).sort((a, b) => b.localeCompare(a));
    return months;
  }, [childRecords]);

  const records = useMemo(() => {
    const q = search.trim().toLowerCase();
    return childRecords.filter((p) => {
      if (monthFilter !== "all" && !p.date.startsWith(monthFilter)) return false;
      if (!q) return true;
      return (
        p.date.includes(q) ||
        p.status.includes(q) ||
        (p.note?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [childRecords, search, monthFilter]);

  const presentCount = records.filter((r) => r.status === "present").length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold">
          Presence
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Attendance for {selectedChild.nickname}
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
                setMonthFilter("all");
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

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs text-neutral-500">Records</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{records.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-xs text-neutral-500">Present</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[#00B894]">
            {presentCount}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="w-full rounded-xl border-0 bg-white px-4 py-2.5 text-sm shadow-sm outline-none sm:max-w-[200px]"
        >
          <option value="all">All months</option>
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {formatMonth(m)}
            </option>
          ))}
        </select>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search date or status…"
          className="w-full rounded-xl border-0 bg-white px-4 py-2.5 text-sm shadow-sm outline-none"
        />
      </div>

      <ul className="space-y-2">
        {records.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
          >
            <div>
              <p className="font-semibold text-neutral-900">
                {formatDate(r.date, "EEE, dd MMM")}
              </p>
              {r.note ? (
                <p className="mt-0.5 text-xs text-neutral-500">{r.note}</p>
              ) : null}
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${tone(r.status)}`}
            >
              {r.status}
            </span>
          </li>
        ))}
        {records.length === 0 ? (
          <li className="rounded-2xl bg-white py-10 text-center text-sm text-neutral-500 shadow-sm">
            No presence records
          </li>
        ) : null}
      </ul>
    </div>
  );
}
