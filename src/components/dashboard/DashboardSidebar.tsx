"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Baby,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  ClipboardPen,
  FileText,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Sparkles,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/format";

const navGroups = [
  {
    title: "Utama",
    items: [
      { href: "/dashboard", label: "Beranda", icon: LayoutDashboard },
      {
        href: "/dashboard/registration",
        label: "Pendaftaran",
        icon: ClipboardPen,
      },
      { href: "/dashboard/parents", label: "Orang tua", icon: UserRound },
    ],
  },
  {
    title: "Akademik",
    items: [
      { href: "/dashboard/students", label: "Siswa", icon: Baby },
      { href: "/dashboard/users", label: "Users", icon: Users },
      { href: "/dashboard/classes", label: "Kelas", icon: GraduationCap },
      { href: "/dashboard/kegiatan", label: "Kegiatan", icon: Sparkles },
      { href: "/dashboard/presence", label: "Tanggal", icon: CalendarDays },
      { href: "/dashboard/absensi", label: "Absensi", icon: ClipboardList },
      { href: "/dashboard/reports", label: "Laporan", icon: FileText },
    ],
  },
  {
    title: "Keuangan",
    items: [
      { href: "/dashboard/tuition", label: "SPP", icon: Receipt },
      { href: "/dashboard/kas", label: "Kas", icon: Landmark },
      { href: "/dashboard/finance", label: "Keuangan", icon: Wallet },
      { href: "/dashboard/events", label: "Acara", icon: CalendarRange },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(href);
}

export function DashboardSidebar({
  onToggleMobile,
}: {
  onToggleMobile?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClass = (href: string) => {
    const active = isActive(pathname, href);
    return cn(
      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
      active
        ? "bg-[#2E7DFF] text-white shadow-sm shadow-[#2E7DFF]/25"
        : "text-[#5B6B7C] hover:bg-[#EEF3FA] hover:text-[#1A2330]",
    );
  };

  const NavLinks = () => (
    <nav className="flex flex-col gap-5">
      {navGroups.map((group) => (
        <div key={group.title}>
          <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A0AAB8]">
            {group.title}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={linkClass(item.href)}
                >
                  <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  const Brand = () => (
    <div className="flex items-center gap-3 px-2">
      <Image
        src="/logo.png"
        alt="BabelKids"
        width={40}
        height={36}
        className="h-10 w-auto object-contain"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-tight text-[#1A2330]">
          BabelKids
        </p>
        <p className="truncate text-[11px] text-[#8A96A8]">Staf · Operasional</p>
      </div>
    </div>
  );

  const Footer = () => (
    <div className="space-y-3 border-t border-[#EEF3FA] bg-white pt-4">
      <div className="px-2">
        <p className="text-sm font-medium text-[#1A2330]">Maya Santoso</p>
        <p className="text-xs text-[#8A96A8]">Pemilik</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E5ECF5] bg-white px-2 py-2 text-xs font-medium text-[#5B6B7C] hover:bg-[#F3F7FC]"
        >
          <UserRound className="size-3.5" />
          Profil
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#F0783C] px-2 py-2 text-xs font-medium text-white hover:bg-[#e06a30]"
        >
          <LogOut className="size-3.5" />
          Keluar
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-30 flex w-full items-center justify-between border-b border-[#E5ECF5] bg-white px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            onToggleMobile?.();
          }}
          className="rounded-xl p-2 text-[#5B6B7C] hover:bg-[#F3F7FC]"
          aria-label="Buka menu"
        >
          <Menu className="size-5" />
        </button>
        <Image
          src="/logo.png"
          alt="BabelKids"
          width={36}
          height={32}
          className="h-8 w-auto object-contain"
        />
        <Link
          href="/"
          className="rounded-xl bg-[#F0783C] px-2.5 py-1.5 text-xs font-medium text-white"
        >
          Keluar
        </Link>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#1A2330]/40"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(18rem,88vw)] flex-col overflow-hidden bg-white p-4 shadow-xl">
            <div className="mb-4 flex shrink-0 items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-[#8A96A8] hover:bg-[#F3F7FC]"
                aria-label="Tutup"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
              <NavLinks />
            </div>
            <div className="shrink-0 pt-3">
              <Footer />
            </div>
          </aside>
        </div>
      ) : null}

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-[#E5ECF5] bg-white p-4 lg:flex">
        <div className="mb-6 shrink-0">
          <Brand />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
          <NavLinks />
        </div>
        <div className="shrink-0 pt-3">
          <Footer />
        </div>
      </aside>
    </>
  );
}
