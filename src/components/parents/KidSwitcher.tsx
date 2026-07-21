"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useParentKids } from "./ParentKidsProvider";
import { getClass } from "@/lib/mock-data";

export function KidSwitcher() {
  const { children, selectedChild, setSelectedChildId } = useParentKids();
  const [open, setOpen] = useState(false);

  if (children.length <= 1) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 shadow-sm">
        <span
          className="flex size-8 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: selectedChild.photoColor }}
        >
          {selectedChild.nickname.slice(0, 1)}
        </span>
        <span className="text-sm font-semibold text-neutral-800">
          {selectedChild.nickname}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-2.5 shadow-sm"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span
          className="flex size-8 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: selectedChild.photoColor }}
        >
          {selectedChild.nickname.slice(0, 1)}
        </span>
        <span className="text-sm font-semibold text-neutral-800">
          {selectedChild.nickname}
        </span>
        <ChevronDown
          className={`size-4 text-neutral-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl bg-white py-1 shadow-xl ring-1 ring-black/5"
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
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-neutral-50 ${
                      active ? "bg-[#D4F8EC]/60" : ""
                    }`}
                  >
                    <span
                      className="flex size-9 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: kid.photoColor }}
                    >
                      {kid.nickname.slice(0, 1)}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-neutral-900">
                        {kid.nickname}
                      </span>
                      <span className="block text-xs text-neutral-500">
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
