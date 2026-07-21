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
import { StudentSearchSelect } from "@/components/dashboard/StudentSearchSelect";
import { formatDate } from "@/lib/format";
import {
  getStudent,
  getTeacher,
  studentReports as initialReports,
  students,
} from "@/lib/mock-data";
import type { StudentReport } from "@/lib/types";

type ModalMode = "add" | "edit" | "view" | null;

export default function ReportsPage() {
  const [rows, setRows] = useState<StudentReport[]>(initialReports);
  const [search, setSearch] = useState("");
  const [studentFilter, setStudentFilter] = useState("all");
  const [modal, setModal] = useState<ModalMode>(null);
  const [active, setActive] = useState<StudentReport | null>(null);
  const [studentId, setStudentId] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (studentFilter !== "all" && r.studentId !== studentFilter) return false;
      if (!q) return true;
      const student = getStudent(r.studentId);
      return (
        (student?.name.toLowerCase().includes(q) ?? false) ||
        r.title.toLowerCase().includes(q) ||
        r.notes.toLowerCase().includes(q)
      );
    });
  }, [rows, search, studentFilter]);

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const skillsRaw = String(fd.get("skills") || "");
    const sid = String(fd.get("studentId") || studentId || active?.studentId);
    if (!sid) return;
    const payload: StudentReport = {
      id: active?.id ?? `r${Date.now()}`,
      studentId: sid,
      teacherId: active?.teacherId ?? "t3",
      date: String(fd.get("date") || new Date().toISOString().slice(0, 10)),
      title: String(fd.get("title") || "Weekly progress"),
      mood: (String(fd.get("mood")) as StudentReport["mood"]) || "happy",
      activities: String(fd.get("activities") || ""),
      meals: String(fd.get("meals") || ""),
      naps: String(fd.get("naps") || ""),
      notes: String(fd.get("notes") || ""),
      skills: skillsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    if (modal === "edit" && active) {
      setRows((prev) => prev.map((r) => (r.id === active.id ? payload : r)));
    } else {
      setRows((prev) => [payload, ...prev]);
    }
    setModal(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Student reports</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Daily / weekly notes submitted by teachers
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setActive(null);
            setStudentId("");
            setModal("add");
          }}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          New report
        </button>
      </div>

      <SearchFilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search reports…">
        <FilterSelect
          label="Student"
          value={studentFilter}
          onChange={setStudentFilter}
          options={[
            { value: "all", label: "All" },
            ...students.map((s) => ({ value: s.id, label: s.nickname })),
          ]}
        />
      </SearchFilterBar>

      {filtered.length === 0 ? (
        <EmptyState message="No reports found." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((r) => {
            const student = getStudent(r.studentId);
            const teacher = getTeacher(r.teacherId);
            return (
              <article key={r.id} className="rounded-lg border border-neutral-200 bg-white p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{student?.name}</h2>
                  <StatusBadge label={r.mood} tone="info" />
                  <span className="text-xs text-neutral-500">
                    {formatDate(r.date)} · {teacher?.name}
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-500">{r.title}</p>
                <p className="mt-3 line-clamp-2 text-sm text-neutral-700">{r.notes}</p>
                <div className="mt-3 flex gap-2 text-xs font-medium">
                  <button type="button" onClick={() => { setActive(r); setModal("view"); }} className="text-neutral-600 hover:text-neutral-900">
                    View
                  </button>
                  <button type="button" onClick={() => { setActive(r); setStudentId(r.studentId); setModal("edit"); }} className="text-neutral-600 hover:text-neutral-900">
                    Edit
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal open={modal === "add" || modal === "edit"} onClose={() => setModal(null)} title={modal === "edit" ? "Edit report" : "New report"} wide>
        <form onSubmit={save} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Student">
              <StudentSearchSelect
                students={students.filter((s) => s.status === "active")}
                value={studentId || active?.studentId || ""}
                onChange={setStudentId}
                required
              />
            </Field>
            <Field label="Date">
              <input name="date" type="date" required defaultValue={active?.date ?? new Date().toISOString().slice(0, 10)} className={inputClass} />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Title">
              <input name="title" required defaultValue={active?.title ?? "Weekly progress"} className={inputClass} />
            </Field>
            <Field label="Mood">
              <select name="mood" defaultValue={active?.mood ?? "happy"} className={inputClass}>
                <option value="happy">Happy</option>
                <option value="ok">OK</option>
                <option value="tired">Tired</option>
                <option value="upset">Upset</option>
              </select>
            </Field>
          </div>
          <Field label="Activities">
            <textarea name="activities" required rows={2} defaultValue={active?.activities} className={inputClass} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Meals">
              <input name="meals" required defaultValue={active?.meals} className={inputClass} />
            </Field>
            <Field label="Naps">
              <input name="naps" required defaultValue={active?.naps} className={inputClass} />
            </Field>
          </div>
          <Field label="Notes for parents">
            <textarea name="notes" required rows={2} defaultValue={active?.notes} className={inputClass} />
          </Field>
          <Field label="Skills (comma separated)">
            <input name="skills" defaultValue={active?.skills.join(", ")} className={inputClass} placeholder="Sharing, Listening" />
          </Field>
          <ModalActions onCancel={() => setModal(null)} submitLabel={modal === "edit" ? "Update" : "Submit"} />
        </form>
      </Modal>

      <Modal open={modal === "view"} onClose={() => setModal(null)} title="Report detail" wide>
        {active ? (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-lg font-semibold">{getStudent(active.studentId)?.name}</p>
              <StatusBadge label={active.mood} tone="info" />
            </div>
            <p className="text-neutral-500">
              {active.title} · {formatDate(active.date)} · {getTeacher(active.teacherId)?.name}
            </p>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div><dt className="text-xs text-neutral-500">Activities</dt><dd>{active.activities}</dd></div>
              <div><dt className="text-xs text-neutral-500">Meals</dt><dd>{active.meals}</dd></div>
              <div><dt className="text-xs text-neutral-500">Naps</dt><dd>{active.naps}</dd></div>
              <div><dt className="text-xs text-neutral-500">Notes</dt><dd>{active.notes}</dd></div>
            </dl>
            <div className="flex flex-wrap gap-1.5">
              {active.skills.map((sk) => (
                <span key={sk} className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700">{sk}</span>
              ))}
            </div>
            <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4">
              <button type="button" onClick={() => setModal(null)} className="rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100">Close</button>
              <button type="button" onClick={() => { setStudentId(active.studentId); setModal("edit"); }} className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white">Edit</button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
