"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { ChildAvatar } from "@/components/parents/ChildAvatar";
import { useParentKids } from "./ParentKidsProvider";
import { getClass } from "@/lib/mock-data";

export function KidSwitcher() {
  const { children, selectedChild, setSelectedChildId } = useParentKids();
  const [open, setOpen] = useState(false);

  if (children.length <= 1) {
    return (
      <ChildAvatar
        gender={selectedChild.gender}
        nickname={selectedChild.nickname}
        size="sm"
      />
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Ganti anak"
      >
        <ChildAvatar
          gender={selectedChild.gender}
          nickname={selectedChild.nickname}
          size="sm"
        />
        <span className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-white shadow-sm">
          <ChevronDown
            className={`size-3 text-[#8A96A8] transition ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Tutup"
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className="absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-[1.5rem] bg-white py-1.5 shadow-xl ring-1 ring-black/5"
          >
            {children.map((kid) => {
              const cls = getClass(kid.classId);
              const active = kid.id === selectedChild.id;
              return (
                <li key={kid.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      setSelectedChildId(kid.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[#F3F7FC] ${
                      active ? "bg-[#EEF3FA]" : ""
                    }`}
                  >
                    <ChildAvatar
                      gender={kid.gender}
                      nickname={kid.nickname}
                      size="sm"
                    />
                    <span>
                      <span className="block text-sm font-medium text-[#1A2330]">
                        {kid.nickname}
                      </span>
                      <span className="block text-xs text-[#8A96A8]">
                        {cls?.name}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </div>
  );
}
