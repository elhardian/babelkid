"use client";

import { useMemo, useState } from "react";
import { BookOpen, MessageCircle, Sparkles } from "lucide-react";
import { ParentsKidsRow } from "@/components/parents/ParentsKidsRow";
import { useParentKids } from "@/components/parents/ParentKidsProvider";
import { formatDate } from "@/lib/format";
import { getTeacher, studentReports } from "@/lib/mock-data";

const moodLabel = {
  happy: { emoji: "😊", text: "Senang" },
  ok: { emoji: "😐", text: "Baik" },
  tired: { emoji: "😴", text: "Lelah" },
  upset: { emoji: "😢", text: "Kurang nyaman" },
};

export default function ParentsReportsPage() {
  const { selectedChildId, selectedChild } = useParentKids();
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
        <h1 className="text-2xl font-medium tracking-tight text-[#1A2330]">
          Laporan
        </h1>
        <p className="mt-1 text-sm text-[#8A96A8]">
          Catatan harian dari guru · {selectedChild.nickname}
        </p>
      </div>

      <section className="rounded-[1.75rem] bg-[#E8F3FC] p-4">
        <div className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#2E7DFF] shadow-sm">
            <BookOpen className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-[#1A2330]">
              Apa itu halaman Laporan?
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#5B6B7C]">
              Di sini guru menulis ringkasan hari anak Anda di sekolah —
              kegiatan, mood, makan, tidur, dan catatan perkembangan. Bukan
              untuk absensi atau foto kelas; itu ada di menu Kehadiran &
              Kegiatan.
            </p>
          </div>
        </div>
        <ul className="mt-3 space-y-2 border-t border-[#C5D9EE]/60 pt-3">
          <li className="flex items-start gap-2 text-xs text-[#5B6B7C]">
            <MessageCircle className="mt-0.5 size-3.5 shrink-0 text-[#2E7DFF]" />
            Baca catatan pribadi guru tentang anak Anda
          </li>
          <li className="flex items-start gap-2 text-xs text-[#5B6B7C]">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-[#F0783C]" />
            Pantau mood, keterampilan, dan perkembangan harian
          </li>
        </ul>
      </section>

      <ParentsKidsRow />

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari laporan…"
        className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm text-[#1A2330] shadow-sm outline-none ring-1 ring-transparent placeholder:text-[#A0AAB8] focus:ring-[#2E7DFF]/40"
      />

      <ul className="space-y-3">
        {reports.map((r) => {
          const teacher = getTeacher(r.teacherId);
          const open = openId === r.id;
          const mood = moodLabel[r.mood];
          return (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : r.id)}
                className="w-full rounded-[1.75rem] bg-white p-5 text-left shadow-sm shadow-black/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-[#8A96A8]">
                      {formatDate(r.date)} · {teacher?.name}
                    </p>
                    <p className="mt-1 font-medium text-[#1A2330]">{r.title}</p>
                  </div>
                  <span
                    className="text-2xl"
                    aria-label={mood.text}
                    title={mood.text}
                  >
                    {mood.emoji}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-[#5B6B7C]">
                  {r.notes}
                </p>

                {open ? (
                  <div className="mt-4 space-y-3 border-t border-[#EEF3FA] pt-4 text-sm">
                    <div>
                      <p className="text-xs font-medium text-[#8A96A8]">
                        Kegiatan
                      </p>
                      <p className="mt-0.5 text-[#1A2330]">{r.activities}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-medium text-[#8A96A8]">
                          Makan
                        </p>
                        <p className="mt-0.5 text-[#1A2330]">{r.meals}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#8A96A8]">
                          Tidur
                        </p>
                        <p className="mt-0.5 text-[#1A2330]">{r.naps}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {r.skills.map((sk) => (
                        <span
                          key={sk}
                          className="rounded-full bg-[#EEF3FA] px-2.5 py-0.5 text-xs font-medium text-[#2E7DFF]"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-xs font-medium text-[#F0783C]">
                    Ketuk untuk detail
                  </p>
                )}
              </button>
            </li>
          );
        })}
        {reports.length === 0 ? (
          <li className="rounded-[1.75rem] bg-white py-10 text-center text-sm text-[#8A96A8] shadow-sm">
            Belum ada laporan untuk {selectedChild.nickname}
          </li>
        ) : null}
      </ul>
    </div>
  );
}
