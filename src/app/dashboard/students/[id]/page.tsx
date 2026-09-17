"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/SearchFilterBar";
import { ageFromDob, formatDate, formatIDR, presenceStatusLabel, tuitionStatusLabel } from "@/lib/format";
import {
  getClass,
  getStudent,
  getTeacher,
  presenceRecords,
  studentReports,
  tuitionRecords,
} from "@/lib/mock-data";

export default function StudentDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const student = getStudent(id);

  if (!student) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/students"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="size-4" />
          Kembali ke siswa
        </Link>
        <p className="text-sm text-neutral-500">Siswa tidak ditemukan.</p>
      </div>
    );
  }

  const cls = getClass(student.classId);
  const teacher = cls ? getTeacher(cls.teacherId) : undefined;
  const history = [...student.classHistory].sort((a, b) =>
    b.startDate.localeCompare(a.startDate),
  );
  const tuition = tuitionRecords
    .filter((t) => t.studentId === student.id)
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 6);
  const presence = presenceRecords
    .filter((p) => p.studentId === student.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);
  const reports = studentReports
    .filter((r) => r.studentId === student.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/students"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="size-4" />
            Kembali ke siswa
          </Link>
          <div className="mt-4 flex items-center gap-4">
            <span
              className="flex size-16 items-center justify-center rounded-full text-xl font-semibold text-[#1A2330]"
              style={{ backgroundColor: student.photoColor }}
            >
              {student.nickname.slice(0, 1)}
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {student.name}
              </h1>
              <p className="mt-0.5 text-sm text-neutral-500">
                {student.nickname}
              </p>
              <div className="mt-2">
                <StatusBadge
                  label={
                    student.status === "active"
                      ? "Aktif"
                      : student.status === "inactive"
                        ? "Nonaktif"
                        : "Alumni"
                  }
                  tone={student.status === "active" ? "success" : "neutral"}
                />
              </div>
            </div>
          </div>
        </div>
        <Link
          href="/dashboard/students"
          className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Edit
        </Link>
      </div>

      <section className="grid gap-4 rounded-lg border border-neutral-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs text-neutral-500">Usia</p>
          <p className="mt-1 font-medium tabular-nums">
            {ageFromDob(student.dateOfBirth)} thn
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Tanggal lahir</p>
          <p className="mt-1 font-medium">{formatDate(student.dateOfBirth)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Jenis kelamin</p>
          <p className="mt-1 font-medium">
            {student.gender === "male" ? "Laki-laki" : "Perempuan"}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Tanggal masuk</p>
          <p className="mt-1 font-medium">{formatDate(student.enrollmentDate)}</p>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold">Kelas saat ini</h2>
        <p className="mt-2 text-lg font-medium">{cls?.name ?? "—"}</p>
        <p className="text-sm text-neutral-500">
          {cls?.level === "preschool"
            ? "Preschool"
            : cls?.level === "kindergarten"
              ? "TK"
              : cls?.level}{" "}
          · Guru: {teacher?.name ?? "—"}
          {cls?.room ? ` · ${cls.room}` : ""}
        </p>
        {cls?.schedule ? (
          <p className="mt-1 text-sm text-neutral-500">{cls.schedule}</p>
        ) : null}
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold">Riwayat kelas</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">Belum ada riwayat kelas.</p>
        ) : (
          <ol className="relative mt-4 space-y-4 border-l border-neutral-200 pl-5">
            {history.map((h) => (
              <li key={h.id} className="relative">
                <span className="absolute -left-[1.4rem] top-1.5 size-2.5 rounded-full bg-neutral-900" />
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="font-medium">{h.className}</p>
                  {!h.endDate ? (
                    <StatusBadge label="saat ini" tone="success" />
                  ) : null}
                </div>
                <p className="text-xs text-neutral-500">
                  {h.level === "preschool"
                    ? "Preschool"
                    : h.level === "kindergarten"
                      ? "TK"
                      : h.level}{" "}
                  · {h.teacherName}
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  {formatDate(h.startDate)}
                  {h.endDate ? ` – ${formatDate(h.endDate)}` : " – sekarang"}
                </p>
                {h.note ? (
                  <p className="mt-1 text-xs text-neutral-500">{h.note}</p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="text-sm font-semibold">Orang tua / wali</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {student.parents.map((p) => (
            <div
              key={p.id}
              className="rounded-md border border-neutral-200 p-3 text-sm"
            >
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-neutral-500">
                {p.relationship === "mother"
                  ? "Ibu"
                  : p.relationship === "father"
                    ? "Ayah"
                    : "Wali"}
              </p>
              <p className="mt-2 text-neutral-700">{p.phone}</p>
              <p className="text-neutral-500">{p.email}</p>
            </div>
          ))}
        </div>
      </section>

      {(student.allergies || student.notes) && (
        <section className="grid gap-4 sm:grid-cols-2">
          {student.allergies ? (
            <div className="rounded-lg border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-semibold">Alergi</h2>
              <p className="mt-2 text-sm text-neutral-700">{student.allergies}</p>
            </div>
          ) : null}
          {student.notes ? (
            <div className="rounded-lg border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-semibold">Catatan</h2>
              <p className="mt-2 text-sm text-neutral-700">{student.notes}</p>
            </div>
          ) : null}
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-lg border border-neutral-200 bg-white">
          <div className="border-b border-neutral-100 px-4 py-3">
            <h2 className="text-sm font-semibold">SPP terbaru</h2>
          </div>
          <ul className="divide-y divide-neutral-100">
            {tuition.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{t.month}</p>
                  <p className="text-xs text-neutral-500">
                    {tuitionStatusLabel(t.status)}
                  </p>
                </div>
                <span className="tabular-nums">{formatIDR(t.amount)}</span>
              </li>
            ))}
            {tuition.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-neutral-500">
                Belum ada data SPP
              </li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white">
          <div className="border-b border-neutral-100 px-4 py-3">
            <h2 className="text-sm font-semibold">Absensi terbaru</h2>
          </div>
          <ul className="divide-y divide-neutral-100">
            {presence.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <p className="font-medium">{formatDate(p.date, "dd MMM")}</p>
                <span className="text-neutral-600">
                  {presenceStatusLabel(p.status)}
                </span>
              </li>
            ))}
            {presence.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-neutral-500">
                Belum ada data absensi
              </li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white">
          <div className="border-b border-neutral-100 px-4 py-3">
            <h2 className="text-sm font-semibold">Laporan terbaru</h2>
          </div>
          <ul className="divide-y divide-neutral-100">
            {reports.map((r) => (
              <li key={r.id} className="px-4 py-3 text-sm">
                <p className="font-medium">{r.title}</p>
                <p className="text-xs text-neutral-500">
                  {formatDate(r.date)} ·{" "}
                  {r.mood === "happy"
                    ? "Senang"
                    : r.mood === "ok"
                      ? "Baik"
                      : r.mood === "tired"
                        ? "Lelah"
                        : r.mood === "upset"
                          ? "Sedih"
                          : r.mood}
                </p>
                <p className="mt-1 line-clamp-2 text-neutral-600">{r.notes}</p>
              </li>
            ))}
            {reports.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-neutral-500">
                Belum ada laporan
              </li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
