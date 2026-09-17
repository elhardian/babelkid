"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { presenceRecords } from "@/lib/mock-data";
import type { PresenceStatus } from "@/lib/types";
import { cn, todayISO } from "@/lib/format";

function summarize(studentId: string, monthPrefix?: string) {
  const rows = presenceRecords.filter((p) => {
    if (p.studentId !== studentId) return false;
    if (monthPrefix && !p.date.startsWith(monthPrefix)) return false;
    return true;
  });
  const counts: Record<PresenceStatus, number> = {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
  };
  for (const r of rows) counts[r.status] += 1;
  const total = rows.length;
  const rate =
    total === 0
      ? null
      : Math.round(((counts.present + counts.late) / total) * 100);
  return { counts, total, rate };
}

export function PresenceSummaryCard({
  studentId,
  nickname,
  href,
  className,
  /** Dashboard uses this-month only; presence page can show all */
  scope = "all",
}: {
  studentId: string;
  nickname: string;
  href?: string;
  className?: string;
  scope?: "month" | "all";
}) {
  const monthPrefix = useMemo(() => todayISO().slice(0, 7), []);
  const monthLabel = useMemo(() => {
    try {
      return format(parseISO(`${monthPrefix}-01`), "MMMM yyyy", { locale: id });
    } catch {
      return monthPrefix;
    }
  }, [monthPrefix]);

  const { counts, total, rate } = useMemo(
    () =>
      summarize(studentId, scope === "month" ? monthPrefix : undefined),
    [studentId, scope, monthPrefix],
  );

  const stats = [
    { label: "Hadir", value: counts.present, color: "text-emerald-600" },
    { label: "Tidak hadir", value: counts.absent, color: "text-rose-600" },
    { label: "Izin", value: counts.excused, color: "text-sky-600" },
    { label: "Telat", value: counts.late, color: "text-amber-700" },
  ];

  const body = (
    <>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-[#8A96A8]">
            {scope === "month"
              ? `Ringkasan kehadiran · ${monthLabel}`
              : "Ringkasan kehadiran"}
          </p>
          <p className="mt-0.5 text-base font-medium text-[#1A2330]">
            {nickname}
          </p>
        </div>
        {rate !== null ? (
          <p className="text-2xl font-medium tabular-nums text-[#2E7DFF]">
            {rate}
            <span className="text-sm font-medium text-[#8A96A8]">%</span>
          </p>
        ) : (
          <p className="text-sm text-[#8A96A8]">—</p>
        )}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-[#F3F7FC] px-1.5 py-2 text-center"
          >
            <p className={`text-sm font-medium tabular-nums ${s.color}`}>
              {s.value}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-[#8A96A8]">
              {s.label}
            </p>
          </div>
        ))}
      </div>
      {total === 0 ? (
        <p className="mt-2 text-xs text-[#8A96A8]">
          {scope === "month"
            ? "Belum ada absensi bulan ini"
            : "Belum ada data absensi"}
        </p>
      ) : null}
    </>
  );

  const shell = cn(
    "block rounded-[1.5rem] bg-white p-4 shadow-sm shadow-black/5",
    href && "transition hover:-translate-y-0.5",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={shell}>
        {body}
      </Link>
    );
  }

  return <div className={shell}>{body}</div>;
}
