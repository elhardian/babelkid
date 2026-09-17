"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronRight, MapPin, Search } from "lucide-react";
import { ChildAvatar } from "@/components/parents/ChildAvatar";
import { useParentKids } from "@/components/parents/ParentKidsProvider";
import { formatDate, formatIDR } from "@/lib/format";
import { events, getStudent } from "@/lib/mock-data";

const tabLabel = {
  upcoming: "Mendatang",
  past: "Selesai",
} as const;

export default function ParentsEventsPage() {
  const { selectedChildId, childIds, selectedChild, setSelectedChildId } =
    useParentKids();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<"selected" | "all">("selected");

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    const ids = scope === "all" ? childIds : [selectedChildId];
    return events
      .filter((e) => e.attendees.some((id) => ids.includes(id)))
      .filter((e) =>
        tab === "upcoming" ? e.status !== "past" : e.status === "past",
      )
      .filter((e) => {
        if (!q) return true;
        return (
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q)
        );
      })
      .sort((a, b) =>
        tab === "upcoming"
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date),
      );
  }, [tab, search, scope, selectedChildId, childIds]);

  const counts = useMemo(() => {
    const ids = scope === "all" ? childIds : [selectedChildId];
    const relevant = events.filter((e) =>
      e.attendees.some((id) => ids.includes(id)),
    );
    return {
      upcoming: relevant.filter((e) => e.status !== "past").length,
      past: relevant.filter((e) => e.status === "past").length,
    };
  }, [scope, selectedChildId, childIds]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-[#1A2330]">
          Acara
        </h1>
        <p className="mt-1 text-sm text-[#8A96A8]">
          Kegiatan sekolah untuk keluarga
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#A0AAB8]" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari judul atau lokasi…"
          className="w-full rounded-2xl border-0 bg-white py-3 pl-10 pr-4 text-sm text-[#1A2330] shadow-sm outline-none ring-1 ring-transparent placeholder:text-[#A0AAB8] focus:ring-[#2E7DFF]/40"
        />
      </div>

      <div className="flex gap-2">
        {childIds.map((id) => {
          const kid = getStudent(id);
          if (!kid) return null;
          const active = scope === "selected" && id === selectedChildId;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setScope("selected");
                setSelectedChildId(id);
              }}
              className={`flex min-w-0 flex-1 items-center gap-2 rounded-[1.25rem] bg-white px-2.5 py-2 shadow-sm transition ${
                active ? "ring-2 ring-[#2E7DFF]" : ""
              }`}
            >
              <ChildAvatar
                gender={kid.gender}
                nickname={kid.nickname}
                size="sm"
                className="!size-8 shrink-0"
              />
              <span className="truncate text-xs font-medium text-[#1A2330]">
                {kid.nickname}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setScope("all")}
          className={`shrink-0 rounded-[1.25rem] bg-white px-3 py-2 text-xs font-medium shadow-sm transition ${
            scope === "all"
              ? "ring-2 ring-[#2E7DFF] text-[#2E7DFF]"
              : "text-[#8A96A8]"
          }`}
        >
          Semua
        </button>
      </div>

      <div className="flex rounded-[1.25rem] bg-white p-1 shadow-sm shadow-black/5">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition ${
              tab === t ? "bg-[#EEF3FA] text-[#2E7DFF]" : "text-[#8A96A8]"
            }`}
          >
            {tabLabel[t]}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
                tab === t
                  ? "bg-[#2E7DFF]/15 text-[#2E7DFF]"
                  : "bg-[#F3F7FC] text-[#8A96A8]"
              }`}
            >
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {list.map((e, i) => {
          const attendees = e.attendees
            .filter((id) => childIds.includes(id))
            .map((id) => getStudent(id))
            .filter(Boolean);

          return (
            <li key={e.id} className="animate-pop-in" style={{ animationDelay: `${i * 50}ms` }}>
              <Link
                href={`/parents/events/${e.id}`}
                className="flex gap-3 overflow-hidden rounded-[1.5rem] bg-white p-2.5 shadow-sm shadow-black/5 transition hover:-translate-y-0.5"
              >
                <div className="relative h-[5.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-[1.15rem]">
                  <Image
                    src={e.coverImage}
                    alt={e.title}
                    fill
                    className="object-cover"
                    sizes="88px"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5 pr-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-medium leading-snug text-[#1A2330]">
                      {e.title}
                    </p>
                    <ChevronRight className="mt-0.5 size-4 shrink-0 text-[#C5CDD8]" />
                  </div>
                  <div className="mt-1.5 flex flex-col gap-0.5 text-[11px] text-[#8A96A8]">
                    <span className="inline-flex items-center gap-1 truncate">
                      <MapPin className="size-3 shrink-0 text-[#7BA3D4]" />
                      {e.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3 shrink-0 text-[#7BA3D4]" />
                      {formatDate(e.date, "d MMM yyyy")}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-[#F0783C]">
                      {e.feePerChild > 0
                        ? formatIDR(e.feePerChild)
                        : "Gratis"}
                    </p>
                    {attendees.length > 0 ? (
                      <div className="flex -space-x-1.5">
                        {attendees.slice(0, 3).map((kid) =>
                          kid ? (
                            <ChildAvatar
                              key={kid.id}
                              gender={kid.gender}
                              nickname={kid.nickname}
                              size="sm"
                              className="!size-6 ring-2 ring-white"
                            />
                          ) : null,
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
        {list.length === 0 ? (
          <li className="rounded-[1.5rem] bg-white py-12 text-center text-sm text-[#8A96A8] shadow-sm">
            Tidak ada acara {tabLabel[tab].toLowerCase()}
            {scope === "selected" ? ` untuk ${selectedChild.nickname}` : ""}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
