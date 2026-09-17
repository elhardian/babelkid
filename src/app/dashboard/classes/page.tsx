"use client";

import { useMemo, useState } from "react";
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
import {
  classes as initialClasses,
  getTeacher,
  studentsInClass,
  teachers,
} from "@/lib/mock-data";
import type { SchoolClass } from "@/lib/types";

type ModalMode = "add" | "edit" | "view" | null;

export default function ClassesPage() {
  const [rows, setRows] = useState<SchoolClass[]>(initialClasses);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [modal, setModal] = useState<ModalMode>(null);
  const [active, setActive] = useState<SchoolClass | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((c) => {
      if (levelFilter !== "all" && c.level !== levelFilter) return false;
      if (!q) return true;
      const teacher = getTeacher(c.teacherId);
      return (
        c.name.toLowerCase().includes(q) ||
        c.room.toLowerCase().includes(q) ||
        (teacher?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [rows, search, levelFilter]);

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: SchoolClass = {
      id: active?.id ?? `c${Date.now()}`,
      name: String(fd.get("name") || ""),
      level: (String(fd.get("level")) as "preschool" | "kindergarten") || "preschool",
      teacherId: String(fd.get("teacherId") || teachers[0]?.id),
      capacity: Number(fd.get("capacity") || 12),
      room: String(fd.get("room") || ""),
      schedule: String(fd.get("schedule") || ""),
    };
    if (modal === "edit" && active) {
      setRows((prev) => prev.map((c) => (c.id === active.id ? payload : c)));
    } else {
      setRows((prev) => [payload, ...prev]);
    }
    setModal(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Kelas</h1>
          <p className="mt-1 text-sm text-neutral-500">Ruangan, guru, dan kapasitas</p>
        </div>
        <button
          type="button"
          onClick={() => { setActive(null); setModal("add"); }}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-[#1A2330] hover:bg-neutral-800"
        >
          Tambah kelas
        </button>
      </div>

      <SearchFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Cari kelas, ruangan, guru…">
        <FilterSelect
          label="Jenjang"
          value={levelFilter}
          onChange={setLevelFilter}
          options={[
            { value: "all", label: "Semua" },
            { value: "preschool", label: "Preschool" },
            { value: "kindergarten", label: "TK" },
          ]}
        />
      </SearchFilterBar>

      {filtered.length === 0 ? (
        <EmptyState message="Tidak ada kelas yang cocok dengan filter." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => {
            const teacher = getTeacher(c.teacherId);
            const enrolled = studentsInClass(c.id).length;
            return (
              <article key={c.id} className="rounded-lg border border-neutral-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{c.name}</h2>
                    <p className="mt-1 text-sm text-neutral-500">{c.schedule}</p>
                  </div>
                  <StatusBadge
                    label={c.level === "kindergarten" ? "TK" : "Preschool"}
                    tone="info"
                  />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-neutral-500">Guru</dt>
                    <dd className="font-medium">{teacher?.name}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">Ruangan</dt>
                    <dd className="font-medium">{c.room}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">Peserta</dt>
                    <dd className="font-medium tabular-nums">{enrolled} / {c.capacity}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">Sisa kursi</dt>
                    <dd className="font-medium tabular-nums">{c.capacity - enrolled}</dd>
                  </div>
                </dl>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-neutral-900"
                    style={{ width: `${Math.min(100, (enrolled / c.capacity) * 100)}%` }}
                  />
                </div>
                <div className="mt-4 flex gap-2 text-xs font-medium">
                  <button type="button" onClick={() => { setActive(c); setModal("view"); }} className="text-neutral-600 hover:text-neutral-900">
                    Lihat
                  </button>
                  <button type="button" onClick={() => { setActive(c); setModal("edit"); }} className="text-neutral-600 hover:text-neutral-900">
                    Edit
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal open={modal === "add" || modal === "edit"} onClose={() => setModal(null)} title={modal === "edit" ? "Edit kelas" : "Tambah kelas"}>
        <form onSubmit={save} className="space-y-3">
          <Field label="Nama kelas">
            <input name="name" required defaultValue={active?.name} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Jenjang">
              <select name="level" defaultValue={active?.level ?? "preschool"} className={inputClass}>
                <option value="preschool">Preschool</option>
                <option value="kindergarten">TK</option>
              </select>
            </Field>
            <Field label="Kapasitas">
              <input name="capacity" type="number" min={1} required defaultValue={active?.capacity ?? 12} className={inputClass} />
            </Field>
          </div>
          <Field label="Guru">
            <select name="teacherId" defaultValue={active?.teacherId ?? teachers[0]?.id} className={inputClass}>
              {teachers.filter((t) => t.role === "teacher" || t.role === "admin").map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ruangan">
              <input name="room" required defaultValue={active?.room} className={inputClass} />
            </Field>
            <Field label="Jadwal">
              <input name="schedule" required defaultValue={active?.schedule ?? "Sen–Jum 08:00–12:00"} className={inputClass} />
            </Field>
          </div>
          <ModalActions onCancel={() => setModal(null)} submitLabel={modal === "edit" ? "Simpan" : "Tambah"} />
        </form>
      </Modal>

      <Modal open={modal === "view"} onClose={() => setModal(null)} title="Detail kelas">
        {active ? (
          <div className="space-y-3 text-sm">
            <p className="text-lg font-semibold">{active.name}</p>
            <dl className="grid grid-cols-2 gap-3">
              <div><dt className="text-xs text-neutral-500">Jenjang</dt><dd>{active.level === "kindergarten" ? "TK" : "Preschool"}</dd></div>
              <div><dt className="text-xs text-neutral-500">Ruangan</dt><dd>{active.room}</dd></div>
              <div><dt className="text-xs text-neutral-500">Guru</dt><dd>{getTeacher(active.teacherId)?.name}</dd></div>
              <div><dt className="text-xs text-neutral-500">Kapasitas</dt><dd>{active.capacity}</dd></div>
              <div className="col-span-2"><dt className="text-xs text-neutral-500">Jadwal</dt><dd>{active.schedule}</dd></div>
            </dl>
            <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
              <button type="button" onClick={() => setModal(null)} className="rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100">Tutup</button>
              <button type="button" onClick={() => setModal("edit")} className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-[#1A2330]">Edit</button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
