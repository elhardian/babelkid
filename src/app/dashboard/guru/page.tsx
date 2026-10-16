"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import {
  useTeachersRegistry,
  type TeacherInput,
} from "@/components/dashboard/TeachersProvider";
import { useClassesRegistry } from "@/components/dashboard/ClassesProvider";
import { useStaffSession } from "@/components/dashboard/StaffSessionProvider";
import { usePermissionAccess } from "@/components/dashboard/RolePermissionsProvider";
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
import { RosterTransferButtons } from "@/components/dashboard/RosterTransferButtons";
import { studentsInClass } from "@/lib/mock-data";
import type { Teacher } from "@/lib/types";
import {
  createStaffAppAccess,
  getStaffAppAccess,
  updateStaffRole,
} from "@/app/actions/staff-access";
import {
  assignableStaffRoles,
  canManageGuruAccess,
  canManageStaffRoles,
} from "@/lib/staff-access";

type ModalMode = "add" | "edit" | "assign" | "access" | null;

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

const staffRoleOptions: { value: Teacher["role"]; label: string }[] = [
  { value: "teacher", label: "Guru" },
  { value: "admin", label: "Admin" },
  { value: "owner", label: "Pemilik" },
];

export default function DashboardGuruPage() {
  const session = useStaffSession();
  const { canWrite } = usePermissionAccess("guru");
  const canManageAccess = canManageGuruAccess(session.role) && canWrite;
  const canManageRoles = canManageStaffRoles(session.role) && canWrite;
  const roleOptions = staffRoleOptions.filter((opt) =>
    assignableStaffRoles(session.role).includes(opt.value),
  );
  const { teachers, upsert, remove } = useTeachersRegistry();
  const { classes, assignTeacher, classesForTeacher } = useClassesRegistry();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [modal, setModal] = useState<ModalMode>(null);
  const [active, setActive] = useState<Teacher | null>(null);
  const [assignClassId, setAssignClassId] = useState("");
  const [role, setRole] = useState<Teacher["role"]>("teacher");
  const [accessPending, startAccess] = useTransition();
  const [accessError, setAccessError] = useState("");
  const [accessResult, setAccessResult] = useState<{
    email: string;
    password: string;
    created: boolean;
  } | null>(null);
  const [accessStatus, setAccessStatus] = useState<
    Record<string, { exists: boolean }>
  >({});

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return teachers.filter((t) => {
      if (roleFilter !== "all" && t.role !== roleFilter) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.phone.toLowerCase().includes(q) ||
        (t.jabatan?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [teachers, search, roleFilter]);

  const { pageItems, page, setPage, totalPages, total, from, to } =
    usePagination(list);

  useEffect(() => {
    if (!canManageAccess) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        pageItems.map(async (t) => {
          const status = await getStaffAppAccess(t.email);
          return [t.email.toLowerCase(), { exists: status.exists }] as const;
        }),
      );
      if (cancelled) return;
      setAccessStatus((prev) => {
        const next = { ...prev };
        for (const [email, st] of entries) next[email] = st;
        return next;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [pageItems, canManageAccess]);

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

  function openAccess(t: Teacher) {
    setActive(t);
    setRole(t.role);
    setAccessError("");
    setAccessResult(null);
    setModal("access");
  }

  function closeModal() {
    setModal(null);
    setActive(null);
    setAssignClassId("");
    setAccessResult(null);
    setAccessError("");
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
      jabatan: String(fd.get("jabatan") || "").trim() || undefined,
      notes: String(fd.get("notes") || "").trim() || undefined,
    };
    if (!input.name || !input.email || !input.phone) return;
    upsert(input);
    if (canManageRoles) {
      void updateStaffRole({
        email: input.email,
        name: input.name,
        phone: input.phone,
        role: input.role,
      });
    }
    closeModal();
  }

  function onAssign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!active || !assignClassId) return;
    assignTeacher(assignClassId, active.id);
    closeModal();
  }

  function onCreateAccess(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!active) return;
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") || "").trim();
    setAccessError("");
    startAccess(async () => {
      const result = await createStaffAppAccess({
        email: active.email,
        name: active.name,
        phone: active.phone,
        role,
        password: password || undefined,
      });
      if (!result.ok) {
        setAccessError(result.error);
        return;
      }
      if (active.role !== role) {
        upsert({
          id: active.id,
          name: active.name,
          email: active.email,
          phone: active.phone,
          role,
          jabatan: active.jabatan,
          notes: active.notes,
        });
      }
      setAccessResult({
        email: result.email,
        password: result.password,
        created: result.created,
      });
      setAccessStatus((prev) => ({
        ...prev,
        [result.email.toLowerCase()]: { exists: true },
      }));
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-[#1A2330]">
            Guru
          </h1>
          <p className="mt-1 text-sm text-[#8A96A8]">
            Data guru & staf · akses login dashboard · penugasan wali kelas
            {!canWrite ? " · mode baca saja" : ""}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-start">
          <RosterTransferButtons
            kind="teachers"
            teachers={teachers}
            classes={classes}
          />
          {canManageRoles ? (
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2E7DFF] px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-[#2E7DFF]/25 sm:w-auto"
            >
              <Plus className="size-4" />
              Tambah guru
            </button>
          ) : null}
        </div>
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama, jabatan, email, atau HP…"
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
          const app = accessStatus[t.email.toLowerCase()];
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
                    {app?.exists ? (
                      <StatusBadge label="Akses login" tone="success" />
                    ) : null}
                  </div>
                  {t.jabatan ? (
                    <p className="mt-1 text-sm font-medium text-[#5B6B7C]">
                      {t.jabatan}
                    </p>
                  ) : null}
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
                  {canManageAccess ? (
                    <button
                      type="button"
                      onClick={() => openAccess(t)}
                      className="rounded-xl p-2 text-[#5B6B7C] hover:bg-[#EEF3FA] hover:text-[#2E7DFF]"
                      aria-label="Buat akses"
                      title="Buat akses login"
                    >
                      <KeyRound className="size-4" />
                    </button>
                  ) : null}
                  {canManageRoles &&
                  (t.role === "teacher" || t.role === "admin") ? (
                    <button
                      type="button"
                      onClick={() => openAssign(t)}
                      className="rounded-xl bg-[#EEF3FA] px-3 py-2 text-xs font-medium text-[#2E7DFF]"
                    >
                      Tugaskan kelas
                    </button>
                  ) : null}
                  {canManageRoles ? (
                    <>
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
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
        {total === 0 ? <EmptyState message="Belum ada data guru" /> : null}
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
        title={modal === "edit" ? "Edit guru" : "Tambah guru"}
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
              options={roleOptions}
            />
          </Field>
          <Field label="Jabatan">
            <input
              name="jabatan"
              className={inputClass}
              defaultValue={active?.jabatan ?? ""}
              placeholder="cth. Guru Kiddy 2A · Wali kelas"
            />
          </Field>
          <Field label="Catatan (opsional)">
            <textarea
              name="notes"
              className={`${inputClass} min-h-[72px]`}
              defaultValue={active?.notes ?? ""}
              placeholder="Catatan internal"
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
          <ModalActions onCancel={closeModal} submitLabel="Simpan penugasan" />
        </form>
      </Modal>

      <Modal open={modal === "access"} onClose={closeModal} title="Buat akses login">
        {active ? (
          accessResult ? (
            <div className="space-y-3">
              <p className="text-sm text-[#5B6B7C]">
                {accessResult.created
                  ? "Akses dashboard berhasil dibuat."
                  : "Akses dashboard diperbarui (password diganti)."}
              </p>
              <div className="rounded-2xl bg-[#F3F7FC] p-4 text-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
                  Login staf
                </p>
                <p className="mt-2 font-medium text-[#1A2330]">
                  {accessResult.email}
                </p>
                <p className="mt-1 font-mono text-[#2E7DFF]">
                  {accessResult.password}
                </p>
              </div>
              <p className="text-xs text-[#8A96A8]">
                Bagikan ke guru · masuk di /login
              </p>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full bg-[#2E7DFF] px-4 py-2 text-sm font-medium text-white"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onCreateAccess} className="space-y-3">
              <p className="text-sm text-[#5B6B7C]">
                Buat akun login dashboard untuk{" "}
                <strong>{active.name}</strong>
                {active.jabatan ? ` · ${active.jabatan}` : ""}.
              </p>
              <Field label="Email login">
                <input
                  value={active.email}
                  readOnly
                  className={`${inputClass} bg-[#F3F7FC]`}
                />
              </Field>
              <Field label="Peran & izin menu">
                <Select
                  value={role}
                  onChange={(v) => setRole(v as Teacher["role"])}
                  options={roleOptions}
                />
              </Field>
              <p className="text-xs text-[#8A96A8]">
                Guru: akademik & absensi · Admin/Pemilik: semua menu + kelola
                akses
              </p>
              <Field label="Password sementara (opsional)">
                <input
                  name="password"
                  type="text"
                  minLength={6}
                  placeholder="Kosongkan = dibuat otomatis"
                  className={inputClass}
                />
              </Field>
              {accessError ? (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {accessError}
                </p>
              ) : null}
              <ModalActions
                onCancel={closeModal}
                submitLabel={accessPending ? "Menyimpan…" : "Buat akses"}
                submitDisabled={accessPending}
              />
            </form>
          )
        ) : null}
      </Modal>
    </div>
  );
}
