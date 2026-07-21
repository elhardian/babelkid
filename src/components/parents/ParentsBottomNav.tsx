"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  Home,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/format";

const tabs = [
  { href: "/parents", label: "Home", icon: Home },
  { href: "/parents/tuition", label: "Tuition", icon: Receipt },
  { href: "/parents/events", label: "Events", icon: CalendarDays },
  { href: "/parents/presence", label: "Presence", icon: ClipboardList },
  { href: "/parents/reports", label: "Reports", icon: FileText },
];

export function ParentsBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-black/5 bg-white/95 backdrop-blur-md">
      <ul className="grid grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)] pt-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active =
            tab.href === "/parents"
              ? pathname === "/parents"
              : pathname.startsWith(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium transition",
                  active ? "text-[#00B894]" : "text-neutral-400",
                )}
              >
                <Icon
                  className={cn("size-5", active && "stroke-[2.25]")}
                  aria-hidden
                />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
