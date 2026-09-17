"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ChildAvatar } from "@/components/parents/ChildAvatar";
import { useParentKids } from "@/components/parents/ParentKidsProvider";
import { getClass } from "@/lib/mock-data";
import { cn } from "@/lib/format";

/** Equal-width kid chips — tap switches active child; optional detail button */
export function ParentsKidsRow({
  showDetailButton = false,
  className,
}: {
  showDetailButton?: boolean;
  className?: string;
}) {
  const { children, selectedChildId, setSelectedChildId } = useParentKids();

  if (children.length === 0) return null;

  return (
    <div
      className={cn(
        "grid gap-2",
        children.length === 1 && "grid-cols-1",
        children.length === 2 && "grid-cols-2",
        children.length >= 3 && "grid-cols-3",
        className,
      )}
    >
      {children.map((kid) => {
        const active = kid.id === selectedChildId;
        const kidClass = getClass(kid.classId);

        return (
          <div
            key={kid.id}
            className={cn(
              "flex min-w-0 items-center gap-2 rounded-[1.25rem] bg-white p-2 shadow-sm shadow-black/5 transition",
              active && "ring-2 ring-[#2E7DFF]",
            )}
          >
            <button
              type="button"
              onClick={() => setSelectedChildId(kid.id)}
              className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
            >
              <ChildAvatar
                gender={kid.gender}
                nickname={kid.nickname}
                size="sm"
                className="!size-10 shrink-0 ring-2 ring-white"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-[#1A2330]">
                  {kid.nickname}
                </span>
                <span className="block truncate text-[11px] text-[#8A96A8]">
                  {kidClass?.name}
                </span>
              </span>
            </button>
            {showDetailButton ? (
              <Link
                href={`/parents/kids/${kid.id}`}
                onClick={() => setSelectedChildId(kid.id)}
                className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[#EEF3FA] px-2.5 py-1.5 text-[11px] font-medium text-[#2E7DFF]"
                aria-label={`Detail ${kid.nickname}`}
              >
                Detail
                <ChevronRight className="size-3" />
              </Link>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
