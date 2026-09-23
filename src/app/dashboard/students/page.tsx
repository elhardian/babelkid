"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import {
  EmptyState,
  FilterSelect,
  SearchFilterBar,
  StatusBadge,
} from "@/components/dashboard/SearchFilterBar";
import {
  Field,
  Modal,
  ModalActions,
  inputClass,
} from "@/components/dashboard/Modal";
import { ParentMultiSelect } from "@/components/dashboard/ParentMultiSelect";
import { Select } from "@/components/dashboard/Select";
import {
  Pagination,
  usePagination,
} from "@/components/dashboard/Pagination";
import { useParentsRegistry } from "@/components/dashboard/ParentsProvider";
import { useClassesRegistry } from "@/components/dashboard/ClassesProvider";
import { useTeachersRegistry } from "@/components/dashboard/TeachersProvider";
import { useStudentsRegistry } from "@/components/dashboard/StudentsProvider";
import { ageFromDob, formatDate } from "@/lib/format";
import type { Parent, Student, StudentStatus } from "@/lib/types";

type ModalMode = "add" | "edit" | null;

const relLabel = {
  mother: "Ibu",
  father: "Ayah",
  guardian: "Wali",
} as const;

export default function StudentsPage() {
  const { parents: registry, getById } = useParentsRegistry();
  const { classes, getById: getClass } = useClassesRegistry();
  const { getById: getTeacher } = useTeachersRegistry();
  const { students: rows, upsert: upsertStudent } = useStudentsRegistry();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalMode>(null);
  const [active, setActive] = useState<Student | null>(null);
  const [selectedParentIds, setSelectedParentIds] = useState<string[]>([]);
  const [formError, setFormError] = useState("");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [status, setStatus] = useState<StudentStatus>("active");
  const [formClassId, setFormClassId] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((s) => {
      if (classFilter !== "all" && s.classId !== classFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (!q) return true;
      const parentMatch = s.parents.some(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.phone.includes(q),
      );
      return (
        s.name.toLowerCase().includes(q) ||
        s.nickname.toLowerCase().includes(q) ||
        parentMatch
      );
    });
  }, [rows, search, classFilter, statusFilter]);

  const { pageItems, page, setPage, totalPages, total, from, to } =
    usePagination(filtered);

  function openAdd() {
    setActive(null);
    setSelectedParentIds([]);
    setFormError("");
    setGender("female");
    setStatus("active");
    setFormClassId(classes[0]?.id ?? "");
    setModal("add");
  }

  function openEdit(s: Student) {
    setActive(s);
    setSelectedParentIds(s.parents.map((p) => p.id));
    setFormError("");
    setGender(s.gender);
    setStatus(s.status);
    setFormClassId(s.classId);
    setModal("edit");
  }

  function resolveParents(ids: string[]): Parent[] {
    return ids
      .map((id) => getById(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => ({
        id: p.id,
        name: p.name,
        relationship: p.relationship,
        phone: p.phone,
        email: p.email,
      }));
  }

  function saveStudent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    if (selectedParentIds.length === 0) {
      setFormError("Pilih minimal satu orang tua dari daftar.");
      return;
    }
    const linked = resolveParents(selectedParentIds);
    if (linked.length === 0) {
      setFormError("Orang tua yang dipilih tidak valid.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const classId = formClassId || classes[0]?.id;
    const cls = getClass(classId);
    const teacher = cls ? getTeacher(cls.teacherId) : undefined;
    const enrollmentDate =
      active?.enrollmentDate ?? new Date().toISOString().slice(0, 10);

    const payload: Student = {
      id: active?.id ?? `s${Date.now()}`,
      name: String(fd.get("name") || ""),
      nickname: String(fd.get("nickname") || ""),
      dateOfBirth: String(fd.get("dateOfBirth") || ""),
      gender,
      classId,
      status,
      enrollmentDate,
      photoColor: active?.photoColor ?? "#F4A261",
      parents: linked,
      classHistory:
        active?.classHistory ??
        (cls
          ? [
              {
                id: `ch-${Date.now()}`,
                classId: cls.id,
                className: cls.name,
                level: cls.level,
                teacherName: teacher?.name ?? "—",
                startDate: enrollmentDate,
              },
            ]
          : []),
    };

    if (modal === "edit" && active) {
      upsertStudent({ ...active, ...payload, id: active.id });
    } else {
      upsertStudent(payload);
    }
    setModal(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">Siswa</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Profil siswa · orang tua dari daftar registry
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2E7DFF] px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-[#2E7DFF]/25 sm:w-auto"
        >
          Tambah siswa
        </button>
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari siswa atau orang tua…"
      >
        <FilterSelect
          label="Kelas"
          value={classFilter}
          onChange={setClassFilter}
          options={[
            { value: "all", label: "Semua" },
            ...classes.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "Semua" },
            { value: "active", label: "Aktif" },
            { value: "inactive", label: "Nonaktif" },
            { value: "alumni", label: "Alumni" },
          ]}
        />
      </SearchFilterBar>

      {total === 0 ? (
        <EmptyState message="Tidak ada siswa yang cocok dengan filter." />
      ) : (
        <>
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Siswa</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  Kelas
                </th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">
                  Usia
                </th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {pageItems.map((s) => {
                const cls = getClass(s.classId);
                const open = expanded === s.id;
                return (
                  <Fragment key={s.id}>
                    <tr className="hover:bg-neutral-50/80">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex size-9 items-center justify-center rounded-full text-xs font-semibold text-[#1A2330]"
                            style={{ backgroundColor: s.photoColor }}
                          >
                            {s.nickname.slice(0, 1)}
                          </span>
                          <div>
                            <p className="font-medium">{s.name}</p>
                            <p className="text-xs text-neutral-500">
                              {s.nickname}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-neutral-600 sm:table-cell">
                        {cls?.name}
                      </td>
                      <td className="hidden px-4 py-3 tabular-nums text-neutral-600 md:table-cell">
                        {ageFromDob(s.dateOfBirth)} thn
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={
                            s.status === "active"
                              ? "Aktif"
                              : s.status === "inactive"
                                ? "Nonaktif"
                                : "Alumni"
                          }
                          tone={s.status === "active" ? "success" : "neutral"}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2 text-xs font-medium">
                          <Link
                            href={`/dashboard/students/${s.id}`}
                            className="text-neutral-600 hover:text-neutral-900"
                          >
                            Lihat
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEdit(s)}
                            className="text-neutral-600 hover:text-neutral-900"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpanded(open ? null : s.id)}
                            className="text-neutral-600 hover:text-neutral-900"
                          >
                            {open ? "Sembunyikan" : "Orang tua"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {open ? (
                      <tr className="bg-neutral-50">
                        <td colSpan={5} className="px-4 py-4">
                          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                            Orang tua / wali · masuk{" "}
                            {formatDate(s.enrollmentDate)}
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {s.parents.map((p) => (
                              <div
                                key={p.id}
                                className="rounded-md border border-neutral-200 bg-white p-3"
                              >
                                <p className="font-medium">{p.name}</p>
                                <p className="text-xs text-neutral-500">
                                  {relLabel[p.relationship]}
                                </p>
                                <p className="mt-2 text-sm text-neutral-700">
                                  {p.phone}
                                </p>
                                <p className="text-sm text-neutral-500">
                                  {p.email}
                                </p>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          from={from}
          to={to}
          onPageChange={setPage}
        />
        </>
      )}

      <Modal
        open={modal === "add" || modal === "edit"}
        onClose={() => setModal(null)}
        title={modal === "edit" ? "Edit siswa" : "Tambah siswa"}
      >
        <form onSubmit={saveStudent} className="space-y-3">
          <Field label="Nama lengkap">
            <input
              name="name"
              required
              defaultValue={active?.name}
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nama panggilan">
              <input
                name="nickname"
                required
                defaultValue={active?.nickname}
                className={inputClass}
              />
            </Field>
            <Field label="Tanggal lahir">
              <input
                name="dateOfBirth"
                type="date"
                required
                defaultValue={active?.dateOfBirth}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Jenis kelamin">
              <Select
                value={gender}
                onChange={(v) => setGender(v as "male" | "female")}
                options={[
                  { value: "female", label: "Perempuan" },
                  { value: "male", label: "Laki-laki" },
                ]}
              />
            </Field>
            <Field label="Status">
              <Select
                value={status}
                onChange={(v) => setStatus(v as StudentStatus)}
                options={[
                  { value: "active", label: "Aktif" },
                  { value: "inactive", label: "Nonaktif" },
                  { value: "alumni", label: "Alumni" },
                ]}
              />
            </Field>
          </div>
          <Field label="Kelas">
            <Select
              value={formClassId}
              onChange={setFormClassId}
              options={classes.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Field>
          <Field label="Orang tua / wali">
            <ParentMultiSelect
              parents={registry}
              value={selectedParentIds}
              onChange={setSelectedParentIds}
              required
              placeholder="Cari & pilih dari daftar orang tua…"
            />
            <p className="mt-1.5 text-[11px] text-[#A0AAB8]">
              Belum ada? Tambah dulu di menu{" "}
              <Link
                href="/dashboard/parents"
                className="font-medium text-[#2E7DFF] hover:underline"
              >
                Orang tua
              </Link>
              .
            </p>
          </Field>
          {formError ? (
            <p className="text-sm text-rose-600">{formError}</p>
          ) : null}
          <ModalActions
            onCancel={() => setModal(null)}
            submitLabel={modal === "edit" ? "Simpan" : "Tambah"}
          />
        </form>
      </Modal>
    </div>
  );
}
