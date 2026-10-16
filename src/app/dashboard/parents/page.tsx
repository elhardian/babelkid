"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { KeyRound, Plus, Pencil, Trash2 } from "lucide-react";
import { useParentsRegistry } from "@/components/dashboard/ParentsProvider";
import { useStudentsRegistry } from "@/components/dashboard/StudentsProvider";
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
import { getClass } from "@/lib/mock-data";
import type { ParentProfile, Student } from "@/lib/types";
import {
  Pagination,
  usePagination,
} from "@/components/dashboard/Pagination";
import {
  createParentAppAccess,
  getParentAppAccess,
} from "@/app/actions/parent-access";
import { useStaffSession } from "@/components/dashboard/StaffSessionProvider";
import { usePermissionAccess } from "@/components/dashboard/RolePermissionsProvider";
import { canManageParentAccess } from "@/lib/staff-access";

const relLabel = {
  mother: "Ibu",
  father: "Ayah",
  guardian: "Wali",
} as const;

type ModalMode = "add" | "edit" | "access" | null;

function kidsForParent(students: Student[], parent: ParentProfile) {
  return students.filter((s) =>
    s.parents.some(
      (p) =>
        p.id === parent.id ||
        p.email.toLowerCase() === parent.email.toLowerCase(),
    ),
  );
}

function ParentsPageInner() {
  const session = useStaffSession();
  const { canWrite } = usePermissionAccess("parents");
  const canManageAccess = canManageParentAccess(session.role) && canWrite;
  const { parents, upsert, remove } = useParentsRegistry();
  const { students } = useStudentsRegistry();
  const [search, setSearch] = useState("");
  const [relFilter, setRelFilter] = useState("all");
  const [modal, setModal] = useState<ModalMode>(null);
  const [active, setActive] = useState<ParentProfile | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [accessPending, startAccess] = useTransition();
  const [accessError, setAccessError] = useState("");
  const [accessResult, setAccessResult] = useState<{
    email: string;
    password: string;
    created: boolean;
    childCount: number;
  } | null>(null);
  const [accessStatus, setAccessStatus] = useState<
    Record<string, { exists: boolean; childCount: number }>
  >({});

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return parents.filter((p) => {
      if (relFilter !== "all" && p.relationship !== relFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q)
      );
    });
  }, [parents, search, relFilter]);

  const { pageItems, page, setPage, totalPages, total, from, to } =
    usePagination(list);

  useEffect(() => {
    if (!canManageAccess) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        pageItems.map(async (p) => {
          const status = await getParentAppAccess(p.email);
          return [
            p.email.toLowerCase(),
            {
              exists: status.exists,
              childCount: status.exists ? status.childIds.length : 0,
            },
          ] as const;
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
    setModal("add");
  }

  function openEdit(p: ParentProfile) {
    setActive(p);
    setModal("edit");
  }

  function openAccess(p: ParentProfile) {
    setActive(p);
    setAccessError("");
    setAccessResult(null);
    setModal("access");
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    upsert({
      id: active?.id,
      name: String(fd.get("name") || "").trim(),
      relationship: String(fd.get("relationship") || "mother") as
        | "mother"
        | "father"
        | "guardian",
      phone: String(fd.get("phone") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      address: String(fd.get("address") || "").trim() || undefined,
      occupation: String(fd.get("occupation") || "").trim() || undefined,
      notes: String(fd.get("notes") || "").trim() || undefined,
    });
    setModal(null);
    setActive(null);
  }

  function onCreateAccess(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!active) return;
    const fd = new FormData(e.currentTarget);
    const kids = kidsForParent(students, active);
    const password = String(fd.get("password") || "").trim();
    setAccessError("");
    startAccess(async () => {
      const result = await createParentAppAccess({
        email: active.email,
        name: active.name,
        phone: active.phone,
        childIds: kids.map((k) => k.id),
        password: password || undefined,
      });
      if (!result.ok) {
        setAccessError(result.error);
        return;
      }
      setAccessResult({
        email: result.email,
        password: result.password,
        created: result.created,
        childCount: result.childCount,
      });
      setAccessStatus((prev) => ({
        ...prev,
        [result.email.toLowerCase()]: {
          exists: true,
          childCount: result.childCount,
        },
      }));
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1A2330]">
            Orang tua
          </h1>
          <p className="mt-1 text-sm text-[#8A96A8]">
            Kelola data orang tua / wali · {parents.length} terdaftar
            {!canWrite ? " · mode baca saja" : ""}
          </p>
        </div>
        {canWrite ? (
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2E7DFF] px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-[#2E7DFF]/25"
          >
            <Plus className="size-4" />
            Tambah orang tua
          </button>
        ) : null}
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari nama, email, atau nomor HP…"
      >
        <FilterSelect
          label="Hubungan"
          value={relFilter}
          onChange={setRelFilter}
          options={[
            { value: "all", label: "Semua" },
            { value: "mother", label: "Ibu" },
            { value: "father", label: "Ayah" },
            { value: "guardian", label: "Wali" },
          ]}
        />
      </SearchFilterBar>

      <ul className="space-y-3">
        {pageItems.map((p) => {
          const kids = kidsForParent(students, p);
          const open = openId === p.id;
          const app = accessStatus[p.email.toLowerCase()];
          return (
            <li
              key={p.id}
              className="overflow-hidden rounded-2xl border border-[#E5ECF5] bg-white shadow-sm"
            >
              <div className="flex items-start gap-3 px-4 py-4">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : p.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-[#1A2330]">{p.name}</p>
                    <StatusBadge
                      label={relLabel[p.relationship]}
                      tone="info"
                    />
                    {canManageAccess && app?.exists ? (
                      <StatusBadge label="Akses app" tone="success" />
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-[#8A96A8]">
                    {p.phone} · {p.email}
                    {kids.length > 0
                      ? ` · ${kids.length} anak`
                      : " · belum terhubung siswa"}
                  </p>
                </button>
                <div className="flex shrink-0 gap-1">
                  {canManageAccess ? (
                    <button
                      type="button"
                      onClick={() => openAccess(p)}
                      className="rounded-xl p-2 text-[#8A96A8] hover:bg-[#EEF3FA] hover:text-[#2E7DFF]"
                      aria-label="Buat akses app"
                      title="Buat akses app"
                    >
                      <KeyRound className="size-4" />
                    </button>
                  ) : null}
                  {canWrite ? (
                    <>
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="rounded-xl p-2 text-[#8A96A8] hover:bg-[#EEF3FA] hover:text-[#2E7DFF]"
                        aria-label="Edit"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus ${p.name}?`)) remove(p.id);
                        }}
                        className="rounded-xl p-2 text-[#8A96A8] hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Hapus"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>

              {open ? (
                <div className="border-t border-[#EEF3FA] bg-[#F7FAFD] px-4 py-4 text-sm">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
                        Kontak
                      </p>
                      <p className="mt-1 text-[#1A2330]">{p.phone}</p>
                      <p className="text-[#5B6B7C]">{p.email}</p>
                      {p.address ? (
                        <p className="mt-1 text-[#5B6B7C]">{p.address}</p>
                      ) : null}
                      {p.occupation ? (
                        <p className="text-[#8A96A8]">{p.occupation}</p>
                      ) : null}
                      {p.notes ? (
                        <p className="mt-2 text-[#5B6B7C]">{p.notes}</p>
                      ) : null}
                      {canManageAccess ? (
                        <button
                          type="button"
                          onClick={() => openAccess(p)}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#2E7DFF] px-3 py-1.5 text-xs font-medium text-white"
                        >
                          <KeyRound className="size-3.5" />
                          {app?.exists ? "Perbarui akses app" : "Buat akses app"}
                        </button>
                      ) : null}
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
                        Anak terhubung
                      </p>
                      {kids.length === 0 ? (
                        <p className="mt-1 text-[#8A96A8]">Belum ada</p>
                      ) : (
                        <ul className="mt-1 space-y-1">
                          {kids.map((k) => {
                            const cls = getClass(k.classId);
                            return (
                              <li
                                key={k.id}
                                className="rounded-xl bg-white px-3 py-2 text-[#1A2330]"
                              >
                                {k.nickname}
                                <span className="text-[#8A96A8]">
                                  {" "}
                                  · {cls?.name}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
        {list.length === 0 ? (
          <EmptyState message="Belum ada data orang tua" />
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
        onClose={() => {
          setModal(null);
          setActive(null);
        }}
        title={modal === "edit" ? "Edit orang tua" : "Tambah orang tua"}
      >
        <form onSubmit={onSubmit} className="space-y-3">
          <Field label="Nama lengkap">
            <input
              name="name"
              required
              defaultValue={active?.name ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Hubungan">
            <select
              name="relationship"
              defaultValue={active?.relationship ?? "mother"}
              className={inputClass}
            >
              <option value="mother">Ibu</option>
              <option value="father">Ayah</option>
              <option value="guardian">Wali</option>
            </select>
          </Field>
          <Field label="No. HP / WhatsApp">
            <input
              name="phone"
              required
              defaultValue={active?.phone ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Email">
            <input
              name="email"
              type="email"
              required
              defaultValue={active?.email ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Alamat">
            <textarea
              name="address"
              rows={2}
              defaultValue={active?.address ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Pekerjaan">
            <input
              name="occupation"
              defaultValue={active?.occupation ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Catatan">
            <textarea
              name="notes"
              rows={2}
              defaultValue={active?.notes ?? ""}
              className={inputClass}
            />
          </Field>
          <ModalActions
            onCancel={() => {
              setModal(null);
              setActive(null);
            }}
            submitLabel="Simpan"
          />
        </form>
      </Modal>

      <Modal
        open={modal === "access"}
        onClose={() => {
          setModal(null);
          setActive(null);
          setAccessResult(null);
          setAccessError("");
        }}
        title="Buat akses app"
      >
        {active ? (
          accessResult ? (
            <div className="space-y-3">
              <p className="text-sm text-[#5B6B7C]">
                {accessResult.created
                  ? "Akses parent app berhasil dibuat."
                  : "Akses parent app diperbarui (password diganti)."}{" "}
                Terhubung ke {accessResult.childCount} anak.
              </p>
              <div className="rounded-2xl bg-[#F3F7FC] p-4 text-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
                  Login orang tua
                </p>
                <p className="mt-2 font-medium text-[#1A2330]">
                  {accessResult.email}
                </p>
                <p className="mt-1 font-mono text-[#2E7DFF]">
                  {accessResult.password}
                </p>
              </div>
              <p className="text-xs text-[#8A96A8]">
                Bagikan ke orang tua · /app lalu masuk
              </p>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModal(null);
                    setActive(null);
                    setAccessResult(null);
                  }}
                  className="rounded-full bg-[#2E7DFF] px-4 py-2 text-sm font-medium text-white"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onCreateAccess} className="space-y-3">
              <p className="text-sm text-[#5B6B7C]">
                Buat akun login untuk <strong>{active.name}</strong> dan tautkan
                ke anak yang terhubung di data siswa.
              </p>
              <div className="rounded-2xl border border-[#E5ECF5] bg-[#F7FAFD] p-3 text-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
                  Anak yang akan ditautkan
                </p>
                {kidsForParent(students, active).length === 0 ? (
                  <p className="mt-2 text-[#F0783C]">
                    Belum ada anak terhubung. Hubungkan orang tua di modul Siswa
                    dulu.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-1">
                    {kidsForParent(students, active).map((k) => (
                      <li key={k.id} className="text-[#1A2330]">
                        {k.nickname}{" "}
                        <span className="text-[#8A96A8]">· {k.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Field label="Email login">
                <input
                  value={active.email}
                  readOnly
                  className={`${inputClass} bg-[#F3F7FC]`}
                />
              </Field>
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
                onCancel={() => {
                  setModal(null);
                  setActive(null);
                }}
                submitLabel={accessPending ? "Menyimpan…" : "Buat akses app"}
                submitDisabled={
                  accessPending ||
                  kidsForParent(students, active).length === 0
                }
              />
            </form>
          )
        ) : null}
      </Modal>
    </div>
  );
}

export default function ParentsPage() {
  return <ParentsPageInner />;
}
