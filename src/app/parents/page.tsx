"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { CalendarDays, Play } from "lucide-react";
import { ParentsKidsRow } from "@/components/parents/ParentsKidsRow";
import { PresenceSummaryCard } from "@/components/parents/PresenceSummaryCard";
import { useParentKids } from "@/components/parents/ParentKidsProvider";
import { useClassActivitiesStore } from "@/components/dashboard/ClassActivityProvider";
import { getClass } from "@/lib/mock-data";
import { formatDate, todayISO } from "@/lib/format";

function daysAgoISO(n: number): string {
  const d = new Date(`${todayISO()}T12:00:00`);
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ParentsHomePage() {
  const { selectedChild } = useParentKids();
  const { forClass } = useClassActivitiesStore();
  const cls = getClass(selectedChild.classId);
  const cutoff = daysAgoISO(2); // today + 2 previous = 3 days

  const activities = useMemo(
    () => forClass(selectedChild.classId).filter((a) => a.date >= cutoff),
    [forClass, selectedChild.classId, cutoff],
  );

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium text-[#1A2330]">Anak saya</h2>
          <Link
            href="/parents/profile"
            className="text-xs font-medium text-[#8A96A8]"
          >
            Profil →
          </Link>
        </div>
        <ParentsKidsRow showDetailButton />
      </section>

      <PresenceSummaryCard
        studentId={selectedChild.id}
        nickname={selectedChild.nickname}
        href="/parents/presence"
        scope="month"
      />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium text-[#1A2330]">
            Kegiatan kelas
          </h2>
          <Link
            href="/parents/activities"
            className="text-xs font-medium text-[#2E7DFF]"
          >
            Lihat semua →
          </Link>
        </div>
        <p className="mb-2 text-xs text-[#8A96A8]">
          {cls?.name} · 3 hari terakhir
        </p>
        <div
          className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {activities.map((a, i) => (
            <Link
              key={a.id}
              href={`/parents/activities/${a.id}`}
              className="group relative h-52 w-[9.75rem] shrink-0 overflow-hidden rounded-[1.5rem] shadow-md shadow-black/10 animate-pop-in"
              style={{ animationDelay: `${80 + i * 70}ms` }}
            >
              {a.images[0] ? (
                <Image
                  src={a.images[0]}
                  alt={a.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="156px"
                />
              ) : (
                <div className="absolute inset-0 bg-[#C8E4F8]" />
              )}
              {a.videoUrl ? (
                <span className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
                  <Play className="size-3 fill-white" />
                </span>
              ) : null}
              <div className="absolute inset-x-2 bottom-2 rounded-xl bg-white/80 p-2.5 shadow-sm backdrop-blur-md">
                <p className="line-clamp-2 text-xs font-medium leading-snug text-[#1A2330]">
                  {a.title}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-[#5B8FD9]">
                  <CalendarDays className="size-2.5 shrink-0" />
                  {formatDate(a.date, "d MMM")}
                </span>
              </div>
            </Link>
          ))}
          {activities.length === 0 ? (
            <div className="flex h-36 w-full items-center justify-center rounded-[1.5rem] bg-white text-sm text-[#8A96A8]">
              Belum ada kegiatan 3 hari terakhir
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link
          href="/parents/presence"
          className="rounded-[1.5rem] bg-white p-4 shadow-sm shadow-black/5 transition hover:-translate-y-0.5"
        >
          <p className="text-xs text-[#8A96A8]">Absensi</p>
          <p className="mt-1 text-base font-medium text-[#1A2330]">Kehadiran</p>
        </Link>
        <Link
          href="/parents/calendar"
          className="rounded-[1.5rem] bg-white p-4 shadow-sm shadow-black/5 transition hover:-translate-y-0.5"
        >
          <p className="text-xs text-[#8A96A8]">Libur & off</p>
          <p className="mt-1 text-base font-medium text-[#1A2330]">
            Kalender
          </p>
        </Link>
      </section>
    </div>
  );
}
