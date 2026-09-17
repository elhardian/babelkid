"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeft, CalendarDays, GraduationCap } from "lucide-react";
import { CampSceneIllustration } from "@/components/parents/ParentsIllustrations";
import { ChildAvatar } from "@/components/parents/ChildAvatar";
import { useParentKids } from "@/components/parents/ParentKidsProvider";
import { ageFromDob, formatDate } from "@/lib/format";
import { getClass, getStudent } from "@/lib/mock-data";

export default function KidDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { childIds, setSelectedChildId } = useParentKids();
  const kid = getStudent(id);

  if (!kid || !childIds.includes(kid.id)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#C8E4F8] px-6">
        <p className="text-sm text-[#8A96A8]">Anak tidak ditemukan.</p>
        <Link href="/parents" className="mt-3 text-sm font-medium text-[#2E7DFF]">
          Kembali
        </Link>
      </div>
    );
  }

  const cls = getClass(kid.classId);

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <div className="relative h-[38vh] min-h-[220px] shrink-0 overflow-hidden animate-hero-zoom">
        <CampSceneIllustration className="absolute inset-0 h-full w-full" />
        <Link
          href="/parents"
          className="absolute left-4 top-[max(1rem,env(safe-area-inset-top))] z-10 flex size-11 items-center justify-center rounded-full bg-white/95 text-[#1A2330] shadow-md"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="absolute inset-x-0 bottom-10 flex justify-center">
          <ChildAvatar
            gender={kid.gender}
            nickname={kid.nickname}
            size="lg"
            className="size-24 ring-4 ring-white shadow-lg"
          />
        </div>
      </div>

      <div className="relative z-10 -mt-8 flex flex-1 flex-col rounded-t-[2rem] bg-white px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 animate-sheet-up">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-[#1A2330]">{kid.nickname}</h1>
          <p className="mt-1 text-sm text-[#8A96A8]">{kid.name}</p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-[1.25rem] bg-[#E8F3FC] p-3 text-center">
          <div>
            <p className="text-[11px] text-[#8A96A8]">Usia</p>
            <p className="mt-0.5 text-sm font-medium text-[#1A2330]">
              {ageFromDob(kid.dateOfBirth)} th
            </p>
          </div>
          <div>
            <p className="text-[11px] text-[#8A96A8]">Kelas</p>
            <p className="mt-0.5 text-sm font-medium text-[#1A2330]">
              {cls?.name?.split(" ")[0] ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-[#8A96A8]">Status</p>
            <p className="mt-0.5 text-sm font-medium capitalize text-[#1A2330]">
              {kid.status === "active" ? "Aktif" : kid.status}
            </p>
          </div>
        </div>

        <ul className="mt-5 space-y-2">
          <li className="flex items-center gap-3 rounded-[1.25rem] bg-[#F7FAFD] px-4 py-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-[#EEF3FA] text-[#2E7DFF]">
              <GraduationCap className="size-5" />
            </span>
            <div>
              <p className="text-xs text-[#8A96A8]">Kelas</p>
              <p className="text-sm font-medium text-[#1A2330]">{cls?.name}</p>
            </div>
          </li>
          <li className="flex items-center gap-3 rounded-[1.25rem] bg-[#F7FAFD] px-4 py-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-[#FFF1E8] text-[#F0783C]">
              <CalendarDays className="size-5" />
            </span>
            <div>
              <p className="text-xs text-[#8A96A8]">Tanggal lahir</p>
              <p className="text-sm font-medium text-[#1A2330]">
                {formatDate(kid.dateOfBirth, "dd MMMM yyyy")}
              </p>
            </div>
          </li>
        </ul>

        <button
          type="button"
          onClick={() => setSelectedChildId(kid.id)}
          className="mt-6 flex w-full items-center justify-center rounded-full bg-[#2E7DFF] py-3.5 text-sm font-medium text-white shadow-lg shadow-[#2E7DFF]/30"
        >
          Jadikan anak aktif di dashboard
        </button>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href="/parents/presence"
            onClick={() => setSelectedChildId(kid.id)}
            className="rounded-full bg-[#E8F3FC] py-3 text-center text-sm font-medium text-[#2E7DFF]"
          >
            Absensi
          </Link>
          <Link
            href="/parents/tuition"
            onClick={() => setSelectedChildId(kid.id)}
            className="rounded-full bg-[#FFF1E8] py-3 text-center text-sm font-medium text-[#F0783C]"
          >
            SPP
          </Link>
        </div>
      </div>
    </div>
  );
}
