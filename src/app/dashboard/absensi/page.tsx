"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Check, CheckCheck } from "lucide-react";
import { useDayOffs } from "@/components/dashboard/DayOffProvider";
import { EmptyState } from "@/components/dashboard/SearchFilterBar";
import {
  isWeekend,
  classes,
  getClass,
  presenceRecords,
  studentsInClass,
} from "@/lib/mock-data";
import { cn, formatDate, presenceStatusLabel, todayISO } from "@/lib/format";
import type { PresenceStatus } from "@/lib/types";

const STATUSES: {
  value: PresenceStatus;
  label: string;
  short: string;
  active: string;
}[] = [
  {
    value: "present",
    label: "Hadir",
    short: "H",
    active: "bg-emerald-500 text-white ring-emerald-500",
  },
  {
    value: "late",
    label: "Telat",
    short: "T",
    active: "bg-amber-500 text-white ring-amber-500",
  },
  {
    value: "absent",
    label: "Absen",
    short: "A",
    active: "bg-rose-500 text-white ring-rose-500",
  },
  {
    value: "excused",
    label: "Izin",
    short: "I",
    active: "bg-sky-500 text-white ring-sky-500",
  },
];

function loadMarks(
  classId: string,
  date: string,
): Record<string, PresenceStatus> {
  const next: Record<string, PresenceStatus> = {};
  for (const s of studentsInClass(classId)) {
    const rec = presenceRecords.find(
      (p) => p.studentId === s.id && p.date === date && p.classId === classId,
    );
    next[s.id] = rec?.status ?? "present";
  }
  return next;
}

export default function AbsensiPage() {
  const { getByDate } = useDayOffs();
  const [classId, setClassId] = useState(classes[0]?.id ?? "c1");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(todayISO);
  const [marks, setMarks] = useState<Record<string, PresenceStatus>>(() =>
    loadMarks(classes[0]?.id ?? "c1", todayISO()),
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [savedFlash, setSavedFlash] = useState(false);

  const selectedOff = getByDate(date);
  const weekend = isWeekend(date);
  const isClosed = weekend || Boolean(selectedOff);
  const cls = getClass(classId);

  const refreshMarks = useCallback((cid: string, d: string) => {
    setMarks(loadMarks(cid, d));
    setSelected(new Set());
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

  const allSelected =
    roster.length > 0 && roster.every((s) => selected.has(s.id));

  function onClassChange(id: string) {
    setClassId(id);
    refreshMarks(id, date);
  }

  function onDateChange(d: string) {
    setDate(d);
    refreshMarks(classId, d);
  }

  function setOne(id: string, status: PresenceStatus) {
    setMarks((m) => ({ ...m, [id]: status }));
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(roster.map((s) => s.id)));
  }

  function bulkApply(status: PresenceStatus) {
    const ids = selected.size > 0 ? [...selected] : roster.map((s) => s.id);
    setMarks((m) => {
      const next = { ...m };
      for (const id of ids) next[id] = status;
      return next;
    });
    setSelected(new Set());
  }

  function save() {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1A2330]">
            Absensi
          </h1>
          <p className="mt-1 text-sm text-[#8A96A8]">
            Pilih kelas & tanggal, lalu tandai status tiap siswa
          </p>
        </div>
        <Link
          href="/dashboard/presence"
          className="text-sm font-medium text-[#2E7DFF] hover:underline"
        >
          Kalender libur (Tanggal) →
        </Link>
      </div>

      {/* Step 1: class filter */}
      <section className="rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
          1. Pilih kelas
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {classes.map((c) => {
            const active = c.id === classId;
            const count = studentsInClass(c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onClassChange(c.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  active
                    ? "bg-[#2E7DFF] text-white shadow-sm shadow-[#2E7DFF]/30"
                    : "bg-[#F3F7FC] text-[#5B6B7C] hover:bg-[#EEF3FA]",
                )}
              >
                {c.name}
                <span
                  className={cn(
                    "ml-1.5 text-xs",
                    active ? "text-white/80" : "text-[#A0AAB8]",
                  )}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 2: date */}
      <section className="rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
          2. Pilih tanggal
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="rounded-xl border border-[#E5ECF5] bg-[#F7FAFD] px-3 py-2 text-sm text-[#1A2330] outline-none focus:border-[#2E7DFF]/40"
          />
          <button
            type="button"
            onClick={() => onDateChange(todayISO())}
            className="rounded-full bg-[#EEF3FA] px-3 py-2 text-sm font-medium text-[#2E7DFF]"
          >
            Hari ini
          </button>
          <p className="text-sm text-[#5B6B7C]">
            {formatDate(date, "EEEE, dd MMMM yyyy")}
            {cls ? ` · ${cls.name}` : ""}
          </p>
        </div>
        {weekend ? (
          <p className="mt-3 rounded-xl bg-[#FFF1E8] px-3 py-2 text-sm text-[#F0783C]">
            Akhir pekan — absensi tidak diambil
          </p>
        ) : selectedOff ? (
          <p className="mt-3 rounded-xl bg-[#EEF3FA] px-3 py-2 text-sm text-[#2E7DFF]">
            {selectedOff.title} — sekolah libur
          </p>
        ) : null}
      </section>

      {isClosed ? (
        <EmptyState message="Hari libur — absensi tidak tersedia. Atur libur di menu Tanggal jika perlu." />
      ) : (
        <>
          {/* Summary + bulk */}
          <section className="rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
                3. Tandai absensi
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-[#8A96A8]">
                <span>
                  Hadir{" "}
                  <strong className="text-emerald-600">{summary.present}</strong>
                </span>
                <span>
                  Telat{" "}
                  <strong className="text-amber-600">{summary.late}</strong>
                </span>
                <span>
                  Absen{" "}
                  <strong className="text-rose-600">{summary.absent}</strong>
                </span>
                <span>
                  Izin{" "}
                  <strong className="text-sky-600">{summary.excused}</strong>
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-3 border-t border-[#EEF3FA] pt-3 sm:flex-row sm:flex-wrap sm:items-center">
              <p className="text-xs text-[#8A96A8]">
                Bulk
                {selected.size > 0
                  ? ` · ${selected.size} dipilih`
                  : " · semua siswa"}
                :
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => bulkApply("present")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-500/25"
                >
                  <CheckCheck className="size-3.5" />
                  Semua hadir
                </button>
                {STATUSES.filter((s) => s.value !== "present").map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => bulkApply(s.value)}
                    className="rounded-full bg-[#F3F7FC] px-3 py-1.5 text-xs font-medium text-[#5B6B7C] hover:bg-[#EEF3FA]"
                  >
                    Set {s.label.toLowerCase()}
                    {selected.size > 0 ? ` (${selected.size})` : ""}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama siswa…"
              className="w-full rounded-xl border border-[#E5ECF5] bg-white px-4 py-2.5 text-sm outline-none placeholder:text-[#A0AAB8] focus:border-[#2E7DFF]/40 sm:max-w-xs"
            />
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[#5B6B7C]">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="size-4 rounded border-[#D5E0EE] text-[#2E7DFF]"
              />
              Pilih semua ({roster.length})
            </label>
          </div>

          {roster.length === 0 ? (
            <EmptyState message="Tidak ada siswa di kelas ini." />
          ) : (
            <ul className="space-y-2">
              {roster.map((s) => {
                const status = marks[s.id] ?? "present";
                const isSel = selected.has(s.id);
                return (
                  <li
                    key={s.id}
                    className={cn(
                      "flex flex-col gap-3 rounded-2xl border bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-3",
                      isSel
                        ? "border-[#2E7DFF]/40 ring-2 ring-[#2E7DFF]/15"
                        : "border-[#E5ECF5]",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSel}
                        onChange={() => toggleSelect(s.id)}
                        className="size-4 shrink-0 rounded border-[#D5E0EE] text-[#2E7DFF]"
                        aria-label={`Pilih ${s.nickname}`}
                      />
                      <span
                        className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                        style={{ backgroundColor: s.photoColor }}
                      >
                        {s.nickname.slice(0, 1)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[#1A2330]">
                          {s.nickname}
                        </p>
                        <p className="truncate text-xs text-[#8A96A8]">
                          {s.name}
                        </p>
                      </div>
                    </div>

                    <div
                      className="grid grid-cols-4 gap-1.5 sm:flex sm:shrink-0"
                      role="group"
                      aria-label={`Status ${s.nickname}`}
                    >
                      {STATUSES.map((opt) => {
                        const active = status === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setOne(s.id, opt.value)}
                            title={opt.label}
                            className={cn(
                              "rounded-xl px-2 py-2 text-center text-xs font-medium transition sm:min-w-[4.25rem] sm:px-3",
                              active
                                ? opt.active
                                : "bg-[#F3F7FC] text-[#8A96A8] hover:bg-[#EEF3FA] hover:text-[#1A2330]",
                            )}
                          >
                            <span className="sm:hidden">{opt.short}</span>
                            <span className="hidden sm:inline">
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5ECF5] bg-white/95 p-3 shadow-lg backdrop-blur">
            <p className="text-xs text-[#8A96A8] sm:text-sm">
              {cls?.name} · {formatDate(date, "d MMM yyyy")} · {summary.total}{" "}
              siswa
            </p>
            <button
              type="button"
              onClick={save}
              className="inline-flex items-center gap-2 rounded-full bg-[#2E7DFF] px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-[#2E7DFF]/25 hover:bg-[#2568d9]"
            >
              {savedFlash ? (
                <>
                  <Check className="size-4" /> Tersimpan
                </>
              ) : (
                "Simpan absensi"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
