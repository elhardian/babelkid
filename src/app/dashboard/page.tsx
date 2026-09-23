"use client";

import Link from "next/link";
import { Box, CalendarCheck, ClipboardPen, Users } from "lucide-react";
import { useRegistrations } from "@/components/dashboard/RegistrationProvider";
import {
  classes,
  currentParentName,
  events,
  students,
  presenceRecords,
} from "@/lib/mock-data";
import { todayISO } from "@/lib/format";

export default function DashboardOverviewPage() {
  const { pendingCount } = useRegistrations();
  const today = todayISO();
  const activeStudents = students.filter((s) => s.status === "active").length;
  const upcomingEvents = events.filter((e) => e.status === "upcoming");
  const todayPresence = presenceRecords.filter((p) => p.date === today).length;

  const masterSummary = [
    { label: "Siswa", value: students.length, href: "/dashboard/students" },
    { label: "Aktif", value: activeStudents, href: "/dashboard/students" },
    { label: "Kelas", value: classes.length, href: "/dashboard/classes" },
    {
      label: "Pendaftaran",
      value: pendingCount,
      href: "/dashboard/registration",
    },
    {
      label: "Acara mendatang",
      value: upcomingEvents.length,
      href: "/dashboard/events",
    },
    {
      label: "Absensi hari ini",
      value: todayPresence,
      href: "/dashboard/absensi",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#1A2330]">
          Beranda
        </h1>
        <p className="mt-1 text-sm text-[#8A96A8]">
          Selamat datang, Maya Santoso · data sinkron dengan Parent App (
          {currentParentName} · Alya & Rafi)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-[#8A96A8]">Siswa aktif</p>
            <Box className="size-4 text-[#A0AAB8]" />
          </div>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-[#1A2330]">
            {activeStudents}
          </p>
          <p className="mt-2 text-xs text-[#8A96A8]">
            {classes.length} kelas berjalan
          </p>
        </div>

        <Link
          href="/dashboard/absensi"
          className="rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-sm transition hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-[#8A96A8]">Absensi hari ini</p>
            <CalendarCheck className="size-4 text-emerald-500" />
          </div>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-emerald-600">
            {todayPresence}
          </p>
          <p className="mt-2 text-xs text-[#8A96A8]">Catatan kehadiran</p>
        </Link>

        <Link
          href="/dashboard/registration"
          className="rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-sm transition hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-[#8A96A8]">Pendaftaran baru</p>
            <ClipboardPen className="size-4 text-[#2E7DFF]" />
          </div>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-[#2E7DFF]">
            {pendingCount}
          </p>
          <p className="mt-2 text-xs text-[#8A96A8]">Perlu review</p>
        </Link>

        <div className="rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-[#8A96A8]">Acara mendatang</p>
            <Users className="size-4 text-[#F0783C]" />
          </div>
          <p className="mt-3 text-2xl font-semibold tabular-nums text-[#1A2330]">
            {upcomingEvents.length}
          </p>
          <p className="mt-2 text-xs text-[#8A96A8]">Acara aktif</p>
        </div>
      </div>

      <section className="rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[#1A2330]">
          Ringkasan operasional
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {masterSummary.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-xl border border-[#EEF3FA] bg-[#F7FAFD] px-3 py-3 transition hover:border-[#2E7DFF]/30"
            >
              <p className="text-xs text-[#8A96A8]">{item.label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-[#1A2330]">
                {item.value}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[#1A2330]">
              Sinkron Parent App
            </h2>
            <p className="mt-1 text-xs text-[#8A96A8]">
              Absensi, tanggal libur, kegiatan kelas, dan laporan guru memakai
              data yang sama dengan /parents.
            </p>
          </div>
          <Link
            href="/parents"
            className="inline-flex w-full shrink-0 items-center justify-center rounded-full bg-[#EEF3FA] px-4 py-2 text-xs font-medium text-[#2E7DFF] sm:w-auto"
          >
            Buka Parent App
          </Link>
        </div>
      </section>
    </div>
  );
}
