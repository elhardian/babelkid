"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  Receipt,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/format";

const leftTabs = [
  { href: "/parents/presence", label: "Absensi", icon: CalendarDays },
  { href: "/parents/tuition", label: "SPP", icon: Receipt },
];

const rightTabs = [
  { href: "/parents/events", label: "Acara", icon: Sparkles },
  { href: "/parents/reports", label: "Laporan", icon: FileText },
];

export function ParentsBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/parents" ? pathname === "/parents" : pathname.startsWith(href);

  return (
    <nav className="pointer-events-none fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto relative flex items-end justify-between rounded-[1.75rem] bg-white/95 px-2 pb-2 pt-2.5 shadow-[0_12px_40px_rgba(26,35,48,0.12)] backdrop-blur-md">
        {leftTabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex w-14 flex-col items-center gap-0.5 rounded-2xl py-1 transition",
                active ? "text-[#2E7DFF]" : "text-[#A0AAB8]",
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.2 : 1.7} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}

        <Link
          href="/parents"
          className="relative -mt-8 flex w-16 flex-col items-center"
        >
          <span
            className={cn(
              "flex size-14 items-center justify-center rounded-full bg-[#2E7DFF] text-white shadow-lg shadow-[#2E7DFF]/35 transition hover:scale-105 active:scale-95",
              pathname === "/parents" && "ring-4 ring-[#2E7DFF]/25",
            )}
          >
            <LayoutDashboard className="size-6" strokeWidth={2} />
          </span>
          <span
            className={cn(
              "mt-1 text-[10px] font-medium",
              pathname === "/parents" ? "text-[#2E7DFF]" : "text-[#A0AAB8]",
            )}
          >
            Dashboard
          </span>
        </Link>

        {rightTabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex w-14 flex-col items-center gap-0.5 rounded-2xl py-1 transition",
                active ? "text-[#2E7DFF]" : "text-[#A0AAB8]",
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.2 : 1.7} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
