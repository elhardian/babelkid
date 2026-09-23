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
import { useClassesRegistry } from "@/components/dashboard/ClassesProvider";
import { useTeachersRegistry } from "@/components/dashboard/TeachersProvider";
import { MediaUploadField } from "@/components/dashboard/ImageUploadField";
import { TeacherSearchSelect } from "@/components/dashboard/TeacherSearchSelect";
import { Select } from "@/components/dashboard/Select";
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
import { studentsInClass } from "@/lib/mock-data";
import { cn, formatDate, todayISO } from "@/lib/format";
import type { ClassActivity } from "@/lib/types";

type ModalMode = "add" | "edit" | null;

export default function DashboardKegiatanPage() {
  const { upsert, remove, forClassMonth } = useClassActivities();
  const { classes, getById: getClass } = useClassesRegistry();
  const { teachers, getById: getTeacher } = useTeachersRegistry();
  const [classId, setClassId] = useState(classes[0]?.id ?? "c1");
  const [cursor, setCursor] = useState(() =>
    startOfMonth(parseISO(todayISO())),
  );
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalMode>(null);
  const [active, setActive] = useState<ClassActivity | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | undefined>();
  const [teacherId, setTeacherId] = useState("");
  const [formClassId, setFormClassId] = useState("");

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
    setVideoUrl(undefined);
    setFormClassId(classId);
    const defaultTeacher =
      (cls ? getTeacher(cls.teacherId)?.id : undefined) ??
      teachers.find((t) => t.role === "teacher")?.id ??
      "";
    setTeacherId(defaultTeacher);
    setModal("add");
  }

  function openEdit(a: ClassActivity) {
    setActive(a);
    setImages([...a.images]);
    setVideoUrl(a.videoUrl);
    setFormClassId(a.classId);
    setTeacherId(
      a.teacherId ??
        teachers.find((t) => t.name === a.teacherName)?.id ??
        "",
    );
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setActive(null);
    setImages([]);
    setVideoUrl(undefined);
    setTeacherId("");
    setFormClassId("");
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const location = String(fd.get("location") || "").trim() || undefined;
    const date = String(fd.get("date") || todayISO());
    const teacher = getTeacher(teacherId);
    if (!teacher) return;

    const input: ClassActivityInput = {
      id: active?.id,
      classId: formClassId || classId,
      date,
      title: String(fd.get("title") || "").trim(),
      description: String(fd.get("description") || "").trim(),
      teacherId: teacher.id,
      teacherName: teacher.name,
      images,
      videoUrl,
      location,
    };
    if (!input.title || !input.description) return;
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
            Dokumentasi harian per kelas · foto & video
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2E7DFF] px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-[#2E7DFF]/25 sm:w-auto"
        >
          <Plus className="size-4" />
          Tambah kegiatan
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {classes.map((c) => {
            const n = studentsInClass(c.id).length;
            const activeCls = classId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setClassId(c.id)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                  activeCls
                    ? "bg-[#2E7DFF] text-white shadow-sm shadow-[#2E7DFF]/25"
                    : "bg-white text-[#5B6B7C] ring-1 ring-[#E5ECF5] hover:bg-[#EEF3FA]",
                )}
              >
                {c.name}
                <span
                  className={cn(
                    "ml-1.5 text-[11px]",
                    activeCls ? "text-white/80" : "text-[#A0AAB8]",
                  )}
                >
                  {n}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCursor((d) => addMonths(d, -1))}
            className="rounded-xl p-2 text-[#5B6B7C] hover:bg-white"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="size-5" />
          </button>
          <p className="min-w-[9rem] text-center text-sm font-medium capitalize text-[#1A2330]">
            {format(cursor, "MMMM yyyy", { locale: localeId })}
          </p>
          <button
            type="button"
            onClick={() => setCursor((d) => addMonths(d, 1))}
            className="rounded-xl p-2 text-[#5B6B7C] hover:bg-white"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari judul, deskripsi, guru…"
      />

      {groupedByDay.length === 0 ? (
        <EmptyState message="Belum ada kegiatan di bulan ini." />
      ) : (
        <div className="space-y-6">
          {groupedByDay.map(([day, items]) => (
            <section key={day}>
              <h2 className="mb-3 text-sm font-semibold text-[#5B6B7C]">
                {formatDate(day)}
              </h2>
              <ul className="space-y-3">
                {items.map((a) => (
                  <li
                    key={a.id}
                    className="overflow-hidden rounded-2xl border border-[#E5ECF5] bg-white shadow-sm"
                  >
                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#1A2330]">{a.title}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-[#5B6B7C]">
                          {a.description}
                        </p>
                        <p className="mt-2 text-xs text-[#8A96A8]">
                          {a.teacherName}
                          {a.location ? ` · ${a.location}` : ""}
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
                    {a.images.length > 0 ? (
                      <div
                        className="flex gap-2 overflow-x-auto border-t border-[#EEF3FA] bg-[#F7FAFD] px-4 py-3"
                        style={{ scrollbarWidth: "none" }}
                      >
                        {a.images.map((src) => (
                          <div
                            key={src}
                            className="relative size-16 shrink-0 overflow-hidden rounded-lg"
                          >
                            <Image
                              src={src}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="64px"
                              unoptimized={
                                src.startsWith("/uploads/") ||
                                src.includes("localhost")
                              }
                            />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Modal
        open={modal === "add" || modal === "edit"}
        onClose={closeModal}
        title={modal === "edit" ? "Edit kegiatan" : "Tambah kegiatan"}
      >
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Kelas">
              <Select
                value={formClassId}
                onChange={setFormClassId}
                options={classes.map((c) => ({ value: c.id, label: c.name }))}
              />
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
            <Field label="Guru">
              <TeacherSearchSelect
                teachers={teachers}
                value={teacherId}
                onChange={setTeacherId}
                required
                placeholder="Cari guru…"
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

          <MediaUploadField
            images={images}
            videoUrl={videoUrl}
            onImagesChange={setImages}
            onVideoChange={setVideoUrl}
          />

          <ModalActions
            onCancel={closeModal}
            submitLabel={modal === "edit" ? "Simpan" : "Tambah"}
          />
        </form>
      </Modal>
    </div>
  );
}
