"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  addMonths,
  format,
  parseISO,
  startOfMonth,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import {
  useClassActivities,
  type ClassActivityInput,
} from "@/components/dashboard/ClassActivityProvider";
import { ImageUploadField } from "@/components/dashboard/ImageUploadField";
import {
  EmptyState,
  SearchFilterBar,
} from "@/components/dashboard/SearchFilterBar";
import {
  Field,
  Modal,
  ModalActions,
  inputClass,
} from "@/components/dashboard/Modal";
import { classes, getClass, studentsInClass } from "@/lib/mock-data";
import { cn, formatDate, todayISO } from "@/lib/format";
import type { ClassActivity } from "@/lib/types";

type ModalMode = "add" | "edit" | null;

export default function DashboardKegiatanPage() {
  const { upsert, remove, forClassMonth } = useClassActivities();
  const [classId, setClassId] = useState(classes[0]?.id ?? "c1");
  const [cursor, setCursor] = useState(() =>
    startOfMonth(parseISO(todayISO())),
  );
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalMode>(null);
  const [active, setActive] = useState<ClassActivity | null>(null);
  const [images, setImages] = useState<string[]>([]);

  const monthPrefix = format(cursor, "yyyy-MM");

  const monthList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return forClassMonth(classId, monthPrefix).filter((a) => {
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.teacherName.toLowerCase().includes(q) ||
        (a.location ?? "").toLowerCase().includes(q)
      );
    });
  }, [forClassMonth, classId, monthPrefix, search]);

  const groupedByDay = useMemo(() => {
    const map = new Map<string, ClassActivity[]>();
    for (const a of monthList) {
      const list = map.get(a.date) ?? [];
      list.push(a);
      map.set(a.date, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [monthList]);

  const cls = getClass(classId);

  function openAdd() {
    setActive(null);
    setImages([]);
    setModal("add");
  }

  function openEdit(a: ClassActivity) {
    setActive(a);
    setImages([...a.images]);
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setActive(null);
    setImages([]);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const videoUrl = String(fd.get("videoUrl") || "").trim() || undefined;
    const location = String(fd.get("location") || "").trim() || undefined;
    const date = String(fd.get("date") || todayISO());

    const input: ClassActivityInput = {
      id: active?.id,
      classId: String(fd.get("classId") || classId),
      date,
      title: String(fd.get("title") || "").trim(),
      description: String(fd.get("description") || "").trim(),
      teacherName: String(fd.get("teacherName") || "").trim(),
      images,
      videoUrl,
      location,
    };
    if (!input.title || !input.description || !input.teacherName) return;
    upsert(input);
    closeModal();
    setClassId(input.classId);
    setCursor(startOfMonth(parseISO(input.date)));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1A2330]">
            Kegiatan kelas
          </h1>
          <p className="mt-1 text-sm text-[#8A96A8]">
            Aktivitas harian per kelas · foto via MinIO · tampil di Parent App
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2E7DFF] px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-[#2E7DFF]/25"
        >
          <Plus className="size-4" />
          Tambah kegiatan
        </button>
      </div>

      {/* Horizontal class chips */}
      <section className="rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-[#8A96A8]">
          Pilih kelas
        </p>
        <div
          className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
          style={{ scrollbarWidth: "thin" }}
        >
          {classes.map((c) => {
            const activeChip = c.id === classId;
            const count = studentsInClass(c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setClassId(c.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition",
                  activeChip
                    ? "bg-[#2E7DFF] text-white shadow-sm shadow-[#2E7DFF]/30"
                    : "bg-[#F3F7FC] text-[#5B6B7C] hover:bg-[#EEF3FA]",
                )}
              >
                {c.name}
                <span
                  className={cn(
                    "ml-1.5 text-xs",
                    activeChip ? "text-white/80" : "text-[#A0AAB8]",
                  )}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Month navigator */}
      <div className="flex items-center justify-between rounded-2xl border border-[#E5ECF5] bg-white px-2 py-2 shadow-sm">
        <button
          type="button"
          onClick={() => setCursor((c) => addMonths(c, -1))}
          className="rounded-full p-2 text-[#5B6B7C] transition hover:bg-[#EEF3FA]"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="text-center">
          <p className="text-base font-medium capitalize text-[#1A2330]">
            {format(cursor, "MMMM yyyy", { locale: localeId })}
          </p>
          <p className="text-xs text-[#8A96A8]">
            {cls?.name} · {monthList.length} kegiatan
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCursor((c) => addMonths(c, 1))}
          className="rounded-full p-2 text-[#5B6B7C] transition hover:bg-[#EEF3FA]"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari judul, guru, atau lokasi…"
      />

      <div className="space-y-5">
        {groupedByDay.map(([date, items]) => (
          <section key={date}>
            <h2 className="mb-2 text-sm font-medium text-[#5B6B7C]">
              {formatDate(date, "EEEE, d MMMM yyyy")}
            </h2>
            <ul className="space-y-3">
              {items.map((a) => (
                <li
                  key={a.id}
                  className="rounded-2xl border border-[#E5ECF5] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    {a.images[0] ? (
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[#F3F7FC]">
                        <Image
                          src={a.images[0]}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="64px"
                          unoptimized={
                            a.images[0].startsWith("/uploads/") ||
                            a.images[0].includes("localhost")
                          }
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-[#1A2330]">{a.title}</p>
                          <p className="mt-0.5 text-xs text-[#8A96A8]">
                            {a.teacherName}
                            {a.location ? ` · ${a.location}` : ""}
                            {a.images.length
                              ? ` · ${a.images.length} foto`
                              : ""}
                            {a.videoUrl ? " · video" : ""}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(a)}
                            className="rounded-xl p-2 text-[#5B6B7C] hover:bg-[#EEF3FA]"
                            aria-label="Edit"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm("Hapus kegiatan ini?")) remove(a.id);
                            }}
                            className="rounded-xl p-2 text-rose-600 hover:bg-rose-50"
                            aria-label="Hapus"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-[#5B6B7C]">
                        {a.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {monthList.length === 0 ? (
          <EmptyState message="Belum ada kegiatan di bulan ini" />
        ) : null}
      </div>

      <Modal
        open={modal !== null}
        onClose={closeModal}
        title={modal === "edit" ? "Edit kegiatan" : "Tambah kegiatan"}
        wide
      >
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Kelas">
              <select
                name="classId"
                className={inputClass}
                defaultValue={active?.classId ?? classId}
                required
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tanggal">
              <input
                type="date"
                name="date"
                className={inputClass}
                defaultValue={
                  active?.date ??
                  (todayISO().startsWith(monthPrefix)
                    ? todayISO()
                    : `${monthPrefix}-01`)
                }
                required
              />
            </Field>
          </div>
          <Field label="Judul">
            <input
              name="title"
              className={inputClass}
              defaultValue={active?.title ?? ""}
              required
              placeholder="cth. Seni lukis jari"
            />
          </Field>
          <Field label="Deskripsi">
            <textarea
              name="description"
              className={`${inputClass} min-h-[100px]`}
              defaultValue={active?.description ?? ""}
              required
              placeholder="Ceritakan kegiatan hari ini…"
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nama guru">
              <input
                name="teacherName"
                className={inputClass}
                defaultValue={active?.teacherName ?? ""}
                required
                placeholder="Bu Dewi"
              />
            </Field>
            <Field label="Lokasi (opsional)">
              <input
                name="location"
                className={inputClass}
                defaultValue={active?.location ?? ""}
                placeholder="Ruang Seni"
              />
            </Field>
          </div>

          <ImageUploadField value={images} onChange={setImages} />

          <Field label="URL video (opsional)">
            <input
              name="videoUrl"
              className={inputClass}
              defaultValue={active?.videoUrl ?? ""}
              placeholder="https://…"
            />
          </Field>
          <ModalActions
            onCancel={closeModal}
            submitLabel={modal === "edit" ? "Simpan" : "Tambah"}
          />
        </form>
      </Modal>
    </div>
  );
}
