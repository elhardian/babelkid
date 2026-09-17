"use client";

import Link from "next/link";
import { ChevronRight, LogOut, Receipt } from "lucide-react";
import { ChildAvatar } from "@/components/parents/ChildAvatar";
import { useParentKids } from "@/components/parents/ParentKidsProvider";
import { getClass } from "@/lib/mock-data";
import { ageFromDob, formatDate } from "@/lib/format";

export default function ParentsProfilePage() {
  const {
    parentName,
    children,
    selectedChild,
    selectedChildId,
    setSelectedChildId,
  } = useParentKids();

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] bg-white p-5 text-center shadow-sm shadow-black/5">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#EEF3FA] text-2xl font-medium text-[#2E7DFF]">
          {parentName.slice(0, 1)}
        </div>
        <h1 className="mt-3 text-xl font-medium text-[#1A2330]">{parentName}</h1>
        <p className="mt-1 text-sm text-[#8A96A8]">Orang tua · BabelKids</p>
      </section>

      <section>
        <h2 className="mb-3 text-base font-medium text-[#1A2330]">Anak saya</h2>
        <ul className="space-y-2">
          {children.map((kid) => {
            const cls = getClass(kid.classId);
            const active = kid.id === selectedChildId;
            return (
              <li key={kid.id}>
                <button
                  type="button"
                  onClick={() => setSelectedChildId(kid.id)}
                  className={`flex w-full items-center gap-3 rounded-[1.5rem] bg-white p-3 text-left shadow-sm shadow-black/5 transition ${
                    active ? "ring-2 ring-[#2E7DFF]" : ""
                  }`}
                >
                  <ChildAvatar
                    gender={kid.gender}
                    nickname={kid.nickname}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[#1A2330]">{kid.nickname}</p>
                    <p className="text-xs text-[#8A96A8]">
                      {kid.name} · {cls?.name}
                    </p>
                    <p className="mt-0.5 text-xs text-[#8A96A8]">
                      {ageFromDob(kid.dateOfBirth)} th · lahir{" "}
                      {formatDate(kid.dateOfBirth, "dd MMM yyyy")}
                    </p>
                  </div>
                  {active ? (
                    <span className="rounded-full bg-[#EEF3FA] px-2.5 py-1 text-[11px] font-medium text-[#2E7DFF]">
                      Aktif
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm shadow-black/5">
        <Link
          href="/parents/tuition"
          className="flex items-center gap-3 border-b border-[#EEF3FA] px-4 py-3.5"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl bg-[#FFF1E8] text-[#F0783C]">
            <Receipt className="size-5" />
          </span>
          <span className="flex-1 text-sm font-medium text-[#1A2330]">SPP</span>
          <ChevronRight className="size-4 text-[#A0AAB8]" />
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3.5"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl bg-[#EEF3FA] text-[#2E7DFF]">
            <LogOut className="size-5" />
          </span>
          <span className="flex-1 text-sm font-medium text-[#1A2330]">
            Keluar ke website
          </span>
          <ChevronRight className="size-4 text-[#A0AAB8]" />
        </Link>
      </section>

      <p className="text-center text-xs text-[#8A96A8]">
        Sedang melihat profil {selectedChild.nickname}
      </p>
    </div>
  );
}
