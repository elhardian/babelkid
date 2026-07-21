"use client";

import { useCallback, useMemo, useState } from "react";
import {
  EmptyState,
  FilterSelect,
  SearchFilterBar,
  StatusBadge,
} from "@/components/dashboard/SearchFilterBar";
import type { PresenceStatus } from "@/lib/types";
import { classes, presenceRecords, studentsInClass } from "@/lib/mock-data";
import { todayISO } from "@/lib/format";

const statusCycle: PresenceStatus[] = ["present", "late", "absent", "excused"];

function nextStatus(current: PresenceStatus): PresenceStatus {
  const i = statusCycle.indexOf(current);
  return statusCycle[(i + 1) % statusCycle.length];
}

function tone(status: PresenceStatus) {
  if (status === "present") return "success" as const;
  if (status === "absent") return "danger" as const;
  if (status === "late") return "warning" as const;
  return "info" as const;
}

function loadMarks(classId: string, date: string): Record<string, PresenceStatus> {
  const next: Record<string, PresenceStatus> = {};
  for (const s of studentsInClass(classId)) {
    const rec = presenceRecords.find(
      (p) => p.studentId === s.id && p.date === date && p.classId === classId,
    );
    next[s.id] = rec?.status ?? "present";
  }
  return next;
}

export default function PresencePage() {
  const [classId, setClassId] = useState(classes[0]?.id ?? "c1");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(todayISO());
  const [marks, setMarks] = useState<Record<string, PresenceStatus>>(() =>
    loadMarks(classes[0]?.id ?? "c1", todayISO()),
  );

  const refreshMarks = useCallback((cid: string, d: string) => {
    setMarks(loadMarks(cid, d));
  }, []);

  const roster = useMemo(() => {
    const q = search.trim().toLowerCase();
    return studentsInClass(classId).filter((s) => {
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.nickname.toLowerCase().includes(q)
      );
    });
  }, [classId, search]);

  const summary = useMemo(() => {
    const values = roster.map((s) => marks[s.id] ?? "present");
    return {
      total: values.length,
      present: values.filter((v) => v === "present").length,
      late: values.filter((v) => v === "late").length,
      absent: values.filter((v) => v === "absent").length,
      excused: values.filter((v) => v === "excused").length,
    };
  }, [roster, marks]);

  function onClassChange(id: string) {
    setClassId(id);
    refreshMarks(id, date);
  }

  function onDateChange(d: string) {
    setDate(d);
    refreshMarks(classId, d);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Presence</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Mobile-friendly attendance · tap to cycle status
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total", value: summary.total },
          { label: "Present", value: summary.present },
          { label: "Late", value: summary.late },
          { label: "Absent", value: summary.absent },
          { label: "Excused", value: summary.excused },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-neutral-200 bg-white p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">
              {s.label}
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <SearchFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search student…">
        <FilterSelect
          label="Class"
          value={classId}
          onChange={onClassChange}
          options={classes.map((c) => ({ value: c.id, label: c.name }))}
        />
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <span className="whitespace-nowrap">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="rounded-md border border-neutral-200 bg-white px-2.5 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
          />
        </label>
        <button
          type="button"
          onClick={() => onDateChange(todayISO())}
          className="rounded-md border border-neutral-200 px-2.5 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
        >
          Today
        </button>
      </SearchFilterBar>

      {roster.length === 0 ? (
        <EmptyState message="No students in this class." />
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {roster.map((s) => {
            const status = marks[s.id] ?? "present";
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() =>
                    setMarks((m) => ({
                      ...m,
                      [s.id]: nextStatus(m[s.id] ?? "present"),
                    }))
                  }
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-4 text-left active:bg-neutral-50"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: s.photoColor }}
                    >
                      {s.nickname.slice(0, 1)}
                    </span>
                    <div>
                      <p className="font-medium">{s.nickname}</p>
                      <p className="text-xs text-neutral-500">{s.name}</p>
                    </div>
                  </div>
                  <StatusBadge label={status} tone={tone(status)} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        className="w-full rounded-md bg-neutral-900 py-3 text-sm font-medium text-white hover:bg-neutral-800 sm:w-auto sm:px-6"
        onClick={() => alert(`Presence saved for ${date} (demo)`)}
      >
        Save presence
      </button>
    </div>
  );
}
