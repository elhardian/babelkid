"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, LogOut, Menu } from "lucide-react";

const labels: Record<string, string> = {
  "/dashboard": "Beranda",
  "/dashboard/registration": "Pendaftaran",
  "/dashboard/students": "Siswa",
  "/dashboard/classes": "Kelas",
  "/dashboard/kegiatan": "Kegiatan",
  "/dashboard/tuition": "SPP",
  "/dashboard/kas": "Kas",
  "/dashboard/events": "Acara",
  "/dashboard/finance": "Keuangan",
  "/dashboard/presence": "Tanggal",
  "/dashboard/absensi": "Absensi",
  "/dashboard/reports": "Laporan",
  "/dashboard/parents": "Orang tua",
};

export function DashboardTopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const base = Object.keys(labels)
    .sort((a, b) => b.length - a.length)
    .find((key) => pathname === key || pathname.startsWith(`${key}/`));
  const current = base ? labels[base] : "Beranda";

  return (
    <header className="sticky top-0 z-20 hidden items-center justify-between border-b border-[#E5ECF5] bg-white/95 px-6 py-3 backdrop-blur lg:flex">
      <div className="flex items-center gap-2 text-sm text-[#8A96A8]">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl p-1.5 text-[#8A96A8] hover:bg-[#F3F7FC] hover:text-[#1A2330]"
          aria-label="Menu"
        >
          <Menu className="size-4" />
        </button>
        <span>Dashboard</span>
        <ChevronRight className="size-3.5 opacity-60" />
        <span className="font-medium text-[#1A2330]">{current}</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-[#8A96A8]">maya@babelkids.id</span>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#F0783C] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#e06a30]"
        >
          <LogOut className="size-3.5" />
          Keluar
        </Link>
      </div>
    </header>
  );
}
