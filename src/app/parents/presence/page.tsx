"use client";

import { useMemo, useState } from "react";
import { AttendanceCalendar } from "@/components/AttendanceCalendar";
import { useDayOffsStore } from "@/components/dashboard/DayOffProvider";
import { ParentsKidsRow } from "@/components/parents/ParentsKidsRow";
import { PresenceSummaryCard } from "@/components/parents/PresenceSummaryCard";
import { useParentKids } from "@/components/parents/ParentKidsProvider";
import {
  formatDate,
  presenceStatusLabel,
  todayISO,
} from "@/lib/format";
import { isWeekend, presenceRecords } from "@/lib/mock-data";
import type { PresenceStatus } from "@/lib/types";

export default function ParentsPresencePage() {
  const { selectedChildId, selectedChild } = useParentKids();
  const { dayOffs, getByDate } = useDayOffsStore();
  const [date, setDate] = useState(todayISO);

  const presenceByDate = useMemo(() => {
    const map: Record<string, PresenceStatus> = {};
    for (const p of presenceRecords) {
      if (p.studentId === selectedChildId) {
        map[p.date] = p.status;
      }
    }
    return map;
  }, [selectedChildId]);

  const dayPresence = presenceByDate[date];
  const off = getByDate(date);
  const weekend = isWeekend(date);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-[#1A2330]">
          Kehadiran
        </h1>
        <p className="mt-1 text-sm text-[#8A96A8]">
          Kalender absensi · {selectedChild.nickname}
        </p>
      </div>

      <ParentsKidsRow />

      <PresenceSummaryCard
        studentId={selectedChild.id}
        nickname={selectedChild.nickname}
      />

      <AttendanceCalendar
        selectedDate={date}
        onSelectDate={setDate}
        dayOffs={dayOffs}
        presenceByDate={presenceByDate}
        variant="parents"
      />

      <div className="rounded-[1.75rem] bg-white p-5 shadow-sm shadow-black/5">
        <p className="text-xs uppercase tracking-wide text-[#8A96A8]">
          {formatDate(date, "EEEE, dd MMMM yyyy")}
        </p>

        {weekend ? (
          <div className="mt-3">
            <p className="text-lg font-medium text-[#F0783C]">Akhir pekan</p>
            <p className="mt-1 text-sm text-[#8A96A8]">
              Sabtu & Minggu libur. Tidak ada kegiatan sekolah.
            </p>
          </div>
        ) : off ? (
          <div className="mt-3">
            <p className="text-lg font-medium text-[#2E7DFF]">{off.title}</p>
            {off.description ? (
              <p className="mt-1 text-sm leading-relaxed text-[#5B6B7C]">
                {off.description}
              </p>
            ) : (
              <p className="mt-1 text-sm text-[#8A96A8]">Hari libur sekolah.</p>
            )}
          </div>
        ) : dayPresence ? (
          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[#8A96A8]">Status absensi</p>
              <p className="mt-1 text-xl font-medium text-[#1A2330]">
                {presenceStatusLabel(dayPresence)}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                dayPresence === "present"
                  ? "bg-emerald-500/15 text-emerald-600"
                  : dayPresence === "late"
                    ? "bg-amber-500/15 text-amber-700"
                    : dayPresence === "absent"
                      ? "bg-rose-500/15 text-rose-600"
                      : "bg-sky-500/15 text-sky-600"
              }`}
            >
              {presenceStatusLabel(dayPresence)}
            </span>
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-lg font-medium text-[#1A2330]">Belum tercatat</p>
            <p className="mt-1 text-sm text-[#8A96A8]">
              Absensi untuk hari ini belum diisi guru.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
