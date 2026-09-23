"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  useTeachersRegistry,
  type TeacherInput,
} from "@/components/dashboard/TeachersProvider";
import { useClassesRegistry } from "@/components/dashboard/ClassesProvider";
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
import { Select } from "@/components/dashboard/Select";
import {
  Pagination,
  usePagination,
} from "@/components/dashboard/Pagination";
import { studentsInClass } from "@/lib/mock-data";
import type { Teacher } from "@/lib/types";

type ModalMode = "add" | "edit" | "assign" | null;

const roleLabel: Record<Teacher["role"], string> = {
  teacher: "Guru",
  admin: "Admin",
  owner: "Pemilik",
};

const roleTone: Record<
  Teacher["role"],
  "neutral" | "success" | "warning" | "info"
> = {
  teacher: "info",
  admin: "warning",
  owner: "success",
};

export default function DashboardUsersPage() {
  const { teachers, upsert, remove } = useTeachersRegistry();
  const { classes, assignTeacher, classesForTeacher } = useClassesRegistry();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modal, setModal] = useState<ModalMode>(null);
  const [active, setActive] = useState<Teacher | null>(null);
  const [assignClassId, setAssignClassId] = useState("");
  const [role, setRole] = useState<Teacher["role"]>("teacher");

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return teachers.filter((t) => {
      if (roleFilter !== "all" && t.role !== roleFilter) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.phone.toLowerCase().includes(q)
      );
    });
  }, [teachers, search, roleFilter]);

  const { pageItems, page, setPage, totalPages, total, from, to } =
    usePagination(list);

  function openAdd() {
    setActive(null);
    setRole("teacher");
    setModal("add");
  }

  function openEdit(t: Teacher) {
    setActive(t);
    setRole(t.role);
    setModal("edit");
  }

  function openAssign(t: Teacher) {
    setActive(t);
    const assigned = classesForTeacher(t.id);
    setAssignClassId(assigned[0]?.id ?? classes[0]?.id ?? "");
    setModal("assign");
  }

  function closeModal() {
    setModal(null);
    setActive(null);
    setAssignClassId("");
  }

  function onSaveUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input: TeacherInput = {
      id: active?.id,
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      role,
      notes: String(fd.get("notes") || "").trim() || undefined,
    };
    if (!input.name || !input.email || !input.phone) return;
    upsert(input);
    closeModal();
  }

  function onAssign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!active || !assignClassId) return;
    assignTeacher(assignClassId, active.id);
    closeModal();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-[#1A2330]">
            Users
          </h1>
          <p className="mt-1 text-sm text-[#8A96A8]">
            Akun staf (guru, admin, pemilik) · guru bisa ditugaskan sebagai wali
            kelas
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2E7DFF] px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-[#2E7DFF]/25 sm:w-auto"
        >
          <Plus className="size-4" />
          Tambah user
        </button>
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama, email, atau HP…"
      >
        <FilterSelect
          label="Peran"
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { value: "all", label: "Semua" },
            { value: "teacher", label: "Guru" },
            { value: "admin", label: "Admin" },
            { value: "owner", label: "Pemilik" },
          ]}
        />
      </SearchFilterBar>

      <ul className="space-y-3">
        {pageItems.map((t) => {
          const assigned = classesForTeacher(t.id);
          return (
            <li
              key={t.id}
              className="rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-[#1A2330]">{t.name}</p>
                    <StatusBadge
                      label={roleLabel[t.role]}
                      tone={roleTone[t.role]}
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-[#8A96A8]">
                    {t.phone} · {t.email}
                  </p>
                  {t.notes ? (
                    <p className="mt-1 text-sm text-[#5B6B7C]">{t.notes}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {assigned.length === 0 ? (
                      <span className="rounded-full bg-[#F3F7FC] px-2.5 py-0.5 text-[11px] text-[#8A96A8]">
                        Belum ditugaskan ke kelas
                      </span>
                    ) : (
                      assigned.map((c) => (
                        <span
                          key={c.id}
                          className="rounded-full bg-[#2E7DFF]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#2E7DFF]"
                        >
                          {c.name}
                          <span className="font-normal text-[#2E7DFF]/70">
                            {" "}
                            · {studentsInClass(c.id).length}/{c.capacity}
                          </span>
                        </span>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1">
                  {t.role === "teacher" || t.role === "admin" ? (
                    <button
                      type="button"
                      onClick={() => openAssign(t)}
                      className="rounded-xl bg-[#EEF3FA] px-3 py-2 text-xs font-medium text-[#2E7DFF]"
                    >
                      Tugaskan kelas
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => openEdit(t)}
                    className="rounded-xl p-2 text-[#5B6B7C] hover:bg-[#EEF3FA]"
                    aria-label="Edit"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Hapus ${t.name}?`)) remove(t.id);
                    }}
                    className="rounded-xl p-2 text-rose-600 hover:bg-rose-50"
                    aria-label="Hapus"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </li>
          );
        })}
        {total === 0 ? (
          <EmptyState message="Belum ada data user" />
        ) : null}
      </ul>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        from={from}
        to={to}
        onPageChange={setPage}
      />

      <Modal
        open={modal === "add" || modal === "edit"}
        onClose={closeModal}
        title={modal === "edit" ? "Edit user" : "Tambah user"}
      >
        <form onSubmit={onSaveUser} className="space-y-3">
          <Field label="Nama lengkap">
            <input
              name="name"
              required
              className={inputClass}
              defaultValue={active?.name ?? ""}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Email">
              <input
                name="email"
                type="email"
                required
                className={inputClass}
                defaultValue={active?.email ?? ""}
              />
            </Field>
            <Field label="No. HP">
              <input
                name="phone"
                required
                className={inputClass}
                defaultValue={active?.phone ?? ""}
              />
            </Field>
          </div>
          <Field label="Peran">
            <Select
              value={role}
              onChange={(v) => setRole(v as Teacher["role"])}
              options={[
                { value: "teacher", label: "Guru" },
                { value: "admin", label: "Admin" },
                { value: "owner", label: "Pemilik" },
              ]}
            />
          </Field>
          <Field label="Catatan (opsional)">
            <textarea
              name="notes"
              className={`${inputClass} min-h-[72px]`}
              defaultValue={active?.notes ?? ""}
              placeholder="cth. Wali kelas Little Sprouts"
            />
          </Field>
          <ModalActions
            onCancel={closeModal}
            submitLabel={modal === "edit" ? "Simpan" : "Tambah"}
          />
        </form>
      </Modal>

      <Modal
        open={modal === "assign"}
        onClose={closeModal}
        title={`Tugaskan kelas · ${active?.name ?? ""}`}
      >
        <form onSubmit={onAssign} className="space-y-3">
          <p className="text-sm text-[#8A96A8]">
            User ini menjadi wali kelas untuk kelas yang dipilih. Kelas yang
            sebelumnya memakai wali lain akan diganti.
          </p>
          <Field label="Kelas">
            <Select
              value={assignClassId}
              onChange={setAssignClassId}
              required
              options={classes.map((c) => {
                const current = teachers.find((u) => u.id === c.teacherId);
                return {
                  value: c.id,
                  label: `${c.name} · ${c.level}`,
                  hint: current ? `Sekarang: ${current.name}` : undefined,
                };
              })}
            />
          </Field>
          <p className="text-xs text-[#A0AAB8]">
            Penugasan ini juga memperbarui wali kelas di modul Kelas.
          </p>
          <ModalActions onCancel={closeModal} submitLabel="Simpan penugasan" />
        </form>
      </Modal>
    </div>
  );
}
