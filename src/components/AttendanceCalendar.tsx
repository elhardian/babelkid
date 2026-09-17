"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, presenceStatusLabel, presenceStatusColor } from "@/lib/format";
import { isWeekend } from "@/lib/mock-data";
import type { PresenceStatus, SchoolDayOff } from "@/lib/types";

const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export type CalendarDayKind = "weekday" | "weekend" | "holiday";

export interface AttendanceCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  dayOffs?: SchoolDayOff[];
  /** Map of YYYY-MM-DD → presence status (parents view) */
  presenceByDate?: Record<string, PresenceStatus>;
  /** Soft light style for parents app */
  variant?: "dashboard" | "parents";
  className?: string;
}

function toIso(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export function AttendanceCalendar({
  selectedDate,
  onSelectDate,
  dayOffs = [],
  presenceByDate = {},
  variant = "dashboard",
  className,
}: AttendanceCalendarProps) {
  const selected = parseISO(selectedDate);
  const [cursor, setCursor] = useState(
    () => startOfMonth(selected),
  );

  const offByDate = useMemo(() => {
    const map = new Map<string, SchoolDayOff>();
    for (const o of dayOffs) map.set(o.date, o);
    return map;
  }, [dayOffs]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const isParents = true; // light theme for both parents + dashboard

  return (
    <div
      className={cn(
        "rounded-[1.75rem] bg-white p-4 shadow-sm shadow-black/5",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCursor((c) => addMonths(c, -1))}
          className="rounded-full p-2 text-[#5B6B7C] transition hover:bg-[#EEF3FA]"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="text-base font-medium capitalize text-[#1A2330]">
          {format(cursor, "MMMM yyyy", { locale: id })}
        </p>
        <button
          type="button"
          onClick={() => setCursor((c) => addMonths(c, 1))}
          className="rounded-full p-2 text-[#5B6B7C] transition hover:bg-[#EEF3FA]"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekDays.map((d, i) => (
          <div
            key={d}
            className={cn(
              "py-1 text-center text-[11px] font-medium",
              i >= 5 ? "text-[#A0AAB8]/55" : "text-[#8A96A8]",
            )}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const iso = toIso(day);
          const inMonth = isSameMonth(day, cursor);
          const weekend = isWeekend(iso);
          const off = offByDate.get(iso);
          const selectedDay = isSameDay(day, selected);
          const presence = presenceByDate[iso];
          const presenceColors =
            presence && isParents ? presenceStatusColor(presence) : null;
          const hoverLabel = presence
            ? presenceStatusLabel(presence)
            : off
              ? off.title
              : weekend
                ? "Akhir pekan"
                : undefined;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate(iso)}
              disabled={!inMonth}
              title={hoverLabel}
              className={cn(
                "group relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm transition",
                !inMonth && "opacity-0 pointer-events-none",
                selectedDay &&
                  (isParents
                    ? "bg-[#2E7DFF] text-white shadow-md shadow-[#2E7DFF]/30"
                    : "bg-zinc-100 text-zinc-950"),
                !selectedDay &&
                  weekend &&
                  inMonth &&
                  "bg-transparent text-[#A0AAB8] opacity-40",
                !selectedDay &&
                  !weekend &&
                  off &&
                  inMonth &&
                  (isParents
                    ? "bg-[#EEF3FA] text-[#2E7DFF]"
                    : "bg-sky-500/15 text-sky-300"),
                !selectedDay &&
                  !weekend &&
                  !off &&
                  presence &&
                  presenceColors &&
                  inMonth &&
                  `${presenceColors.bg} ${presenceColors.text}`,
                !selectedDay &&
                  !weekend &&
                  !off &&
                  !presence &&
                  inMonth &&
                  (isParents
                    ? "text-[#1A2330] hover:bg-[#F4F7FB]"
                    : "text-zinc-200 hover:bg-zinc-800"),
              )}
            >
              <span className="tabular-nums">{format(day, "d")}</span>
              {presence && !weekend && !off ? (
                <span
                  className={cn(
                    "mt-0.5 size-1.5 rounded-full",
                    selectedDay
                      ? "bg-white"
                      : presenceColors?.dot ?? "bg-emerald-400",
                  )}
                />
              ) : null}
              {off && !selectedDay ? (
                <span
                  className={cn(
                    "absolute bottom-1 size-1 rounded-full",
                    isParents ? "bg-[#2E7DFF]" : "bg-sky-400",
                  )}
                />
              ) : null}
              {isParents && hoverLabel ? (
                <span className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1A2330] px-2 py-1 text-[10px] font-medium text-white shadow-lg group-hover:block">
                  {hoverLabel}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        className={cn(
          "mt-4 flex flex-wrap gap-3 text-[11px]",
          isParents ? "text-[#8A96A8]" : "text-zinc-500",
        )}
      >
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded bg-[#A0AAB8]/35" />
          Sab/Min libur
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className={cn(
              "size-2.5 rounded",
              isParents ? "bg-[#EEF3FA]" : "bg-sky-500/30",
            )}
          />
          Libur sekolah
        </span>
        {Object.keys(presenceByDate).length > 0 ? (
          <>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-emerald-500" />
              Hadir
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-rose-500" />
              Tidak hadir
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-sky-500" />
              Izin / sakit
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-amber-500" />
              Terlambat
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}
