"use client";

import { useState } from "react";
import Link from "next/link";
import { AttendanceCalendar } from "@/components/AttendanceCalendar";
import { useDayOffsStore } from "@/components/dashboard/DayOffProvider";
import { formatDate, todayISO } from "@/lib/format";
import { isWeekend } from "@/lib/mock-data";

export default function ParentsSchoolCalendarPage() {
  const { dayOffs, getByDate } = useDayOffsStore();
  const today = todayISO();
  const [calDate, setCalDate] = useState(today);
  const off = getByDate(calDate);
  const weekend = isWeekend(calDate);

  const upcoming = [...dayOffs]
    .filter((d) => d.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-[#1A2330]">
          Kalender sekolah
        </h1>
        <p className="mt-1 text-sm text-[#8A96A8]">
          Libur nasional, libur bersama & hari off sekolah
        </p>
      </div>

      <AttendanceCalendar
        selectedDate={calDate}
        onSelectDate={setCalDate}
        dayOffs={dayOffs}
        variant="parents"
      />

      <div className="rounded-[1.5rem] bg-white px-4 py-4 shadow-sm shadow-black/5">
        <p className="text-xs text-[#8A96A8]">
          {formatDate(calDate, "EEEE, dd MMMM yyyy")}
        </p>
        {weekend ? (
          <p className="mt-1 text-sm font-medium text-[#F0783C]">
            Akhir pekan — sekolah libur
          </p>
        ) : off ? (
          <div className="mt-1">
            <p className="text-sm font-medium text-[#2E7DFF]">{off.title}</p>
            {off.description ? (
              <p className="mt-0.5 text-xs leading-relaxed text-[#8A96A8]">
                {off.description}
              </p>
            ) : null}
            <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-[#8A96A8]">
              {off.type === "holiday"
                ? "Libur nasional"
                : off.type === "school_off"
                  ? "Off sekolah"
                  : "Lainnya"}
            </p>
          </div>
        ) : (
          <p className="mt-1 text-sm font-medium text-[#1A2330]">
            Hari masuk · kegiatan kelas berjalan
          </p>
        )}
      </div>

      <section>
        <h2 className="mb-3 text-base font-medium text-[#1A2330]">
          Jadwal libur mendatang
        </h2>
        <ul className="space-y-2">
          {upcoming.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => setCalDate(d.date)}
                className="flex w-full items-start gap-3 rounded-[1.25rem] bg-white px-4 py-3 text-left shadow-sm shadow-black/5"
              >
                <span className="mt-0.5 flex size-10 shrink-0 flex-col items-center justify-center rounded-xl bg-[#EEF3FA] text-[#2E7DFF]">
                  <span className="text-[10px] font-medium uppercase leading-none">
                    {formatDate(d.date, "MMM")}
                  </span>
                  <span className="text-sm font-medium leading-none">
                    {formatDate(d.date, "d")}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-[#1A2330]">
                    {d.title}
                  </span>
                  {d.description ? (
                    <span className="mt-0.5 block text-xs text-[#8A96A8] line-clamp-2">
                      {d.description}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
          {upcoming.length === 0 ? (
            <li className="rounded-[1.25rem] bg-white py-8 text-center text-sm text-[#8A96A8]">
              Tidak ada libur terjadwal
            </li>
          ) : null}
        </ul>
      </section>

      <Link
        href="/parents/presence"
        className="block text-center text-sm font-medium text-[#2E7DFF]"
      >
        Lihat absensi anak →
      </Link>
    </div>
  );
}
