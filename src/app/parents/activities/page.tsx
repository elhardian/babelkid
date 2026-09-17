"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  addMonths,
  format,
  parseISO,
  startOfMonth,
} from "date-fns";
import { id } from "date-fns/locale";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";
import { ParentsKidsRow } from "@/components/parents/ParentsKidsRow";
import { useParentKids } from "@/components/parents/ParentKidsProvider";
import { useClassActivitiesStore } from "@/components/dashboard/ClassActivityProvider";
import { getClass } from "@/lib/mock-data";
import { formatDate, todayISO } from "@/lib/format";

export default function ParentsActivitiesPage() {
  const { selectedChild } = useParentKids();
  const { forClass } = useClassActivitiesStore();
  const cls = getClass(selectedChild.classId);
  const [cursor, setCursor] = useState(() =>
    startOfMonth(parseISO(todayISO())),
  );

  const monthPrefix = format(cursor, "yyyy-MM");

  const activities = useMemo(
    () =>
      forClass(selectedChild.classId).filter((a) =>
        a.date.startsWith(monthPrefix),
      ),
    [forClass, selectedChild.classId, monthPrefix],
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-[#1A2330]">
          Kegiatan kelas
        </h1>
        <p className="mt-1 text-sm text-[#8A96A8]">
          Unggahan guru · {cls?.name}
        </p>
      </div>

      <ParentsKidsRow />

      <div className="flex items-center justify-between rounded-[1.5rem] bg-white px-2 py-2 shadow-sm shadow-black/5">
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

      <ul className="space-y-3">
        {activities.map((a, i) => (
          <li
            key={a.id}
            className="animate-pop-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <Link
              href={`/parents/activities/${a.id}`}
              className="flex gap-3 overflow-hidden rounded-[1.5rem] bg-white p-2.5 shadow-sm shadow-black/5 transition hover:-translate-y-0.5"
            >
              <div className="relative h-[5.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-[1.15rem] bg-[#E8F3FC]">
                {a.images[0] ? (
                  <Image
                    src={a.images[0]}
                    alt={a.title}
                    fill
                    className="object-cover"
                    sizes="88px"
                  />
                ) : null}
                {a.videoUrl ? (
                  <span className="absolute bottom-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/50 text-white">
                    <Play className="size-2.5 fill-white" />
                  </span>
                ) : null}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5 pr-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 text-sm font-medium leading-snug text-[#1A2330]">
                    {a.title}
                  </p>
                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-[#C5CDD8]" />
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-[#8A96A8]">
                  {a.description}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-[#5B8FD9]">
                  <CalendarDays className="size-3 shrink-0" />
                  {formatDate(a.date, "d MMM yyyy")} · {a.teacherName}
                </span>
              </div>
            </Link>
          </li>
        ))}
        {activities.length === 0 ? (
          <li className="rounded-[1.5rem] bg-white py-12 text-center text-sm text-[#8A96A8] shadow-sm">
            Belum ada kegiatan di{" "}
            <span className="capitalize">
              {format(cursor, "MMMM yyyy", { locale: id })}
            </span>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
