"use client";

import { useMemo, useState } from "react";
import { useParentKids } from "@/components/parents/ParentKidsProvider";
import { formatDate } from "@/lib/format";
import { getTeacher, studentReports } from "@/lib/mock-data";

const moodEmoji = {
  happy: "😊",
  ok: "😐",
  tired: "😴",
  upset: "😢",
};

export default function ParentsReportsPage() {
  const { selectedChildId, selectedChild, children, setSelectedChildId } =
    useParentKids();
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const reports = useMemo(() => {
    const q = search.trim().toLowerCase();
    return studentReports
      .filter((r) => r.studentId === selectedChildId)
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter((r) => {
        if (!q) return true;
        return (
          r.title.toLowerCase().includes(q) ||
          r.notes.toLowerCase().includes(q) ||
          r.activities.toLowerCase().includes(q)
        );
      });
  }, [search, selectedChildId]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold">
          Reports
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Notes from the teacher · {selectedChild.nickname}
        </p>
      </div>

      {children.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {children.map((kid) => (
            <button
              key={kid.id}
              type="button"
              onClick={() => {
                setSelectedChildId(kid.id);
                setOpenId(null);
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                kid.id === selectedChildId
                  ? "bg-[#00B894] text-white"
                  : "bg-white text-neutral-600 shadow-sm"
              }`}
            >
              {kid.nickname}
            </button>
          ))}
        </div>
      ) : null}

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search reports…"
        className="w-full rounded-xl border-0 bg-white px-4 py-2.5 text-sm shadow-sm outline-none"
      />

      <ul className="space-y-3">
        {reports.map((r) => {
          const teacher = getTeacher(r.teacherId);
          const open = openId === r.id;
          return (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : r.id)}
                className="w-full rounded-2xl bg-white p-4 text-left shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-neutral-500">
                      {formatDate(r.date)} · {teacher?.name}
                    </p>
                    <p className="mt-1 font-semibold text-neutral-900">
                      {r.title}
                    </p>
                  </div>
                  <span className="text-2xl" aria-hidden>
                    {moodEmoji[r.mood]}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
                  {r.notes}
                </p>

                {open ? (
                  <div className="mt-4 space-y-3 border-t border-neutral-100 pt-4 text-sm">
                    <div>
                      <p className="text-xs font-medium text-neutral-500">
                        Activities
                      </p>
                      <p className="mt-0.5">{r.activities}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-medium text-neutral-500">
                          Meals
                        </p>
                        <p className="mt-0.5">{r.meals}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-neutral-500">
                          Naps
                        </p>
                        <p className="mt-0.5">{r.naps}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {r.skills.map((sk) => (
                        <span
                          key={sk}
                          className="rounded-full bg-[#D8EFE8] px-2.5 py-0.5 text-xs font-medium text-[#00B894]"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-xs font-medium text-[#00B894]">
                    Tap for details
                  </p>
                )}
              </button>
            </li>
          );
        })}
        {reports.length === 0 ? (
          <li className="rounded-2xl bg-white py-10 text-center text-sm text-neutral-500 shadow-sm">
            No reports yet
          </li>
        ) : null}
      </ul>
    </div>
  );
}
