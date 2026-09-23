"use client";

import { useMemo, useState } from "react";
import { useClassesRegistry } from "@/components/dashboard/ClassesProvider";
import { useTeachersRegistry } from "@/components/dashboard/TeachersProvider";
import { TeacherSearchSelect } from "@/components/dashboard/TeacherSearchSelect";
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
import { studentsInClass } from "@/lib/mock-data";
import type { SchoolClass } from "@/lib/types";

type ModalMode = "add" | "edit" | "view" | null;

export default function ClassesPage() {
  const { classes, upsert } = useClassesRegistry();
  const { teachers, getById: getTeacher } = useTeachersRegistry();
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [modal, setModal] = useState<ModalMode>(null);
  const [active, setActive] = useState<SchoolClass | null>(null);
  const [teacherId, setTeacherId] = useState("");
  const [level, setLevel] = useState<"preschool" | "kindergarten">("preschool");
  const [ageMin, setAgeMin] = useState(2);
  const [ageMax, setAgeMax] = useState(3);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return classes.filter((c) => {
      if (levelFilter !== "all" && c.level !== levelFilter) return false;
      if (!q) return true;
      const teacher = getTeacher(c.teacherId);
      return (
        c.name.toLowerCase().includes(q) ||
        c.room.toLowerCase().includes(q) ||
        (teacher?.name.toLowerCase().includes(q) ?? false)
      );
    });
  }, [classes, search, levelFilter, getTeacher]);

  function openAdd() {
    setActive(null);
    setTeacherId(teachers.find((t) => t.role === "teacher")?.id ?? "");
    setLevel("preschool");
    setAgeMin(2);
    setAgeMax(3);
    setModal("add");
  }

  function openEdit(c: SchoolClass) {
    setActive(c);
    setTeacherId(c.teacherId);
    setLevel(c.level);
    setAgeMin(c.ageMinYears);
    setAgeMax(c.ageMaxYears);
    setModal("edit");
  }

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!teacherId) return;
    upsert({
      id: active?.id,
      name: String(fd.get("name") || ""),
      level,
      teacherId,
      capacity: Number(fd.get("capacity") || 12),
      room: String(fd.get("room") || ""),
      schedule: String(fd.get("schedule") || ""),
      ageMinYears: ageMin,
      ageMaxYears: Math.max(ageMin, ageMax),
    });
    setModal(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">Kelas</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Ruangan, guru wali kelas, dan kapasitas
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2E7DFF] px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-[#2E7DFF]/25 sm:w-auto"
        >
          Tambah kelas
        </button>
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari kelas, ruangan, guru…"
      >
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
              <article
                key={c.id}
                className="rounded-lg border border-neutral-200 bg-white p-5"
              >
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
                    <dt className="text-xs text-neutral-500">Wali kelas</dt>
                    <dd className="font-medium">{teacher?.name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">Umur</dt>
                    <dd className="font-medium">
                      {c.ageMinYears}–{c.ageMaxYears} thn
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">Ruangan</dt>
                    <dd className="font-medium">{c.room}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">Peserta</dt>
                    <dd className="font-medium tabular-nums">
                      {enrolled} / {c.capacity}
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-neutral-900"
                    style={{
                      width: `${Math.min(100, (enrolled / c.capacity) * 100)}%`,
                    }}
                  />
                </div>
                <div className="mt-4 flex gap-2 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      setActive(c);
                      setModal("view");
                    }}
                    className="text-neutral-600 hover:text-neutral-900"
                  >
                    Lihat
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="text-neutral-600 hover:text-neutral-900"
                  >
                    Edit
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={modal === "add" || modal === "edit"}
        onClose={() => setModal(null)}
        title={modal === "edit" ? "Edit kelas" : "Tambah kelas"}
      >
        <form onSubmit={save} className="space-y-3">
          <Field label="Nama kelas">
            <input
              name="name"
              required
              defaultValue={active?.name}
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Jenjang">
              <Select
                value={level}
                onChange={(v) =>
                  setLevel(v as "preschool" | "kindergarten")
                }
                options={[
                  { value: "preschool", label: "Preschool" },
                  { value: "kindergarten", label: "TK" },
                ]}
              />
            </Field>
            <Field label="Kapasitas">
              <input
                name="capacity"
                type="number"
                min={1}
                required
                defaultValue={active?.capacity ?? 12}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Umur min (tahun)">
              <input
                type="number"
                min={1}
                max={8}
                step={0.5}
                className={inputClass}
                value={ageMin}
                onChange={(e) => setAgeMin(Number(e.target.value) || 1)}
              />
            </Field>
            <Field label="Umur max (tahun)">
              <input
                type="number"
                min={1}
                max={8}
                step={0.5}
                className={inputClass}
                value={ageMax}
                onChange={(e) => setAgeMax(Number(e.target.value) || 1)}
              />
            </Field>
          </div>
          <Field label="Wali kelas">
            <TeacherSearchSelect
              teachers={teachers}
              value={teacherId}
              onChange={setTeacherId}
              required
              roles={["teacher", "admin"]}
              placeholder="Cari & pilih guru…"
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Ruangan">
              <input
                name="room"
                required
                defaultValue={active?.room}
                className={inputClass}
              />
            </Field>
            <Field label="Jadwal">
              <input
                name="schedule"
                required
                defaultValue={active?.schedule ?? "Sen–Jum 08:00–12:00"}
                className={inputClass}
              />
            </Field>
          </div>
          <ModalActions
            onCancel={() => setModal(null)}
            submitLabel={modal === "edit" ? "Simpan" : "Tambah"}
          />
        </form>
      </Modal>

      <Modal
        open={modal === "view"}
        onClose={() => setModal(null)}
        title="Detail kelas"
      >
        {active ? (
          <div className="space-y-3 text-sm">
            <p className="text-lg font-semibold">{active.name}</p>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-neutral-500">Jenjang</dt>
                <dd>
                  {active.level === "kindergarten" ? "TK" : "Preschool"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Ruangan</dt>
                <dd>{active.room}</dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Wali kelas</dt>
                <dd>{getTeacher(active.teacherId)?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-neutral-500">Kapasitas</dt>
                <dd>{active.capacity}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-neutral-500">Jadwal</dt>
                <dd>{active.schedule}</dd>
              </div>
            </dl>
            <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => openEdit(active)}
                className="rounded-full bg-[#2E7DFF] px-4 py-2 text-sm font-medium text-white"
              >
                Edit
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
