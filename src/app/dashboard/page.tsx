"use client";

import Link from "next/link";
import { Box, CalendarCheck, ClipboardPen, Users } from "lucide-react";
import { useRegistrations } from "@/components/dashboard/RegistrationProvider";
import { useStudentsRegistry } from "@/components/dashboard/StudentsProvider";
import { useClassesRegistry } from "@/components/dashboard/ClassesProvider";
import { useTeachersRegistry } from "@/components/dashboard/TeachersProvider";
import { registry } from "@/lib/runtime-registry";
import { todayISO } from "@/lib/format";
import { useStaffSessionLabel } from "@/components/dashboard/StaffSessionProvider";

export default function DashboardOverviewPage() {
  const { pendingCount } = useRegistrations();
  const { name } = useStaffSessionLabel();
  const { students } = useStudentsRegistry();
  const { classes } = useClassesRegistry();
  const { teachers } = useTeachersRegistry();
  const today = todayISO();
  const activeStudents = students.filter((s) => s.status === "active").length;
  const upcomingEvents = registry.events.filter((e) => e.status === "upcoming");
  const todayPresence = registry.presence.filter((p) => p.date === today).length;
  const owner = teachers.find((t) => t.role === "owner");

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-[#1A2330]">
          Beranda
        </h1>
        <p className="mt-1 text-sm text-[#8A96A8]">
          Selamat datang, {name || owner?.name || "Staf"} ·{" "}
          {today}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {masterSummary.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-sm transition hover:border-[#2E7DFF]/40"
          >
            <p className="text-xs uppercase tracking-wide text-[#8A96A8]">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#1A2330]">
              {item.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            href: "/dashboard/students",
            label: "Siswa",
            icon: Users,
          },
          {
            href: "/dashboard/registration",
            label: "Pendaftaran",
            icon: ClipboardPen,
          },
          {
            href: "/dashboard/absensi",
            label: "Absensi",
            icon: CalendarCheck,
          },
          {
            href: "/dashboard/kas",
            label: "Kas",
            icon: Box,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl border border-[#E5ECF5] bg-white px-4 py-3 text-sm font-medium text-[#1A2330] shadow-sm hover:border-[#2E7DFF]/40"
            >
              <Icon className="size-4 text-[#2E7DFF]" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
