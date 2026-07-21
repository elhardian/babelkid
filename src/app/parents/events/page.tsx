"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useParentKids } from "@/components/parents/ParentKidsProvider";
import { formatDate, formatIDR } from "@/lib/format";
import { events } from "@/lib/mock-data";

export default function ParentsEventsPage() {
  const { selectedChildId, childIds, selectedChild } = useParentKids();
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
      });
  }, [tab, search, scope, selectedChildId, childIds]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold">
          Events
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Incoming & previous activities
        </p>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search events…"
        className="w-full rounded-xl border-0 bg-white px-4 py-2.5 text-sm shadow-sm outline-none"
      />

      <div className="flex rounded-xl bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setScope("selected")}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
            scope === "selected"
              ? "bg-[#00B894] text-white"
              : "text-neutral-500"
          }`}
        >
          {selectedChild.nickname}
        </button>
        <button
          type="button"
          onClick={() => setScope("all")}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${
            scope === "all" ? "bg-[#00B894] text-white" : "text-neutral-500"
          }`}
        >
          All kids
        </button>
      </div>

      <div className="flex rounded-xl bg-white p-1 shadow-sm">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition ${
              tab === t ? "bg-neutral-900 text-white" : "text-neutral-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {list.map((e) => (
          <li key={e.id}>
            <Link
              href={`/parents/events/${e.id}`}
              className="block overflow-hidden rounded-3xl bg-white shadow-sm"
            >
              <div className="relative h-36">
                <Image
                  src={e.coverImage}
                  alt={e.title}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              </div>
              <div className="p-4">
                <p className="text-xs text-neutral-500">
                  {formatDate(e.date)} · {e.location}
                </p>
                <p className="mt-1 font-[family-name:var(--font-fredoka)] text-lg font-semibold">
                  {e.title}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                  {e.description}
                </p>
                <p className="mt-2 text-xs font-medium text-[#00B894]">
                  {e.feePerChild > 0
                    ? `Fee ${formatIDR(e.feePerChild)}`
                    : "Free"}
                  {e.documentation.length > 0
                    ? ` · ${e.documentation.length} docs`
                    : ""}
                </p>
              </div>
            </Link>
          </li>
        ))}
        {list.length === 0 ? (
          <li className="rounded-2xl bg-white py-10 text-center text-sm text-neutral-500 shadow-sm">
            No {tab} events
          </li>
        ) : null}
      </ul>
    </div>
  );
}
