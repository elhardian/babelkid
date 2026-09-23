"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  studentsForParent,
  useParentsRegistry,
} from "@/components/dashboard/ParentsProvider";
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
import type { ParentProfile } from "@/lib/types";
import {
  Pagination,
  usePagination,
} from "@/components/dashboard/Pagination";

const relLabel = {
  mother: "Ibu",
  father: "Ayah",
  guardian: "Wali",
} as const;

type ModalMode = "add" | "edit" | null;

function ParentsPageInner() {
  const { parents, upsert, remove } = useParentsRegistry();
  const [search, setSearch] = useState("");
  const [relFilter, setRelFilter] = useState("all");
  const [modal, setModal] = useState<ModalMode>(null);
  const [active, setActive] = useState<ParentProfile | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

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

  function openAdd() {
    setActive(null);
    setModal("add");
  }

  function openEdit(p: ParentProfile) {
    setActive(p);
    setModal("edit");
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1A2330]">
            Orang tua
          </h1>
          <p className="mt-1 text-sm text-[#8A96A8]">
            Kelola data orang tua / wali · {parents.length} terdaftar
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2E7DFF] px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-[#2E7DFF]/25"
        >
          <Plus className="size-4" />
          Tambah orang tua
        </button>
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
          const kids = studentsForParent(p.id, p.email);
          const open = openId === p.id;
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
                  </div>
                  <p className="mt-0.5 text-xs text-[#8A96A8]">
                    {p.phone} · {p.email}
                    {kids.length > 0
                      ? ` · ${kids.length} anak`
                      : " · belum terhubung siswa"}
                  </p>
                </button>
                <div className="flex shrink-0 gap-1">
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
        open={modal !== null}
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
    </div>
  );
}

export default function ParentsPage() {
  return <ParentsPageInner />;
}
