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
import { ageFromDob, formatDate } from "@/lib/format";
import { classes, getClass, students as initialStudents } from "@/lib/mock-data";
import type { Student, StudentStatus } from "@/lib/types";

type ModalMode = "add" | "edit" | null;

export default function StudentsPage() {
  const [rows, setRows] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalMode>(null);
  const [active, setActive] = useState<Student | null>(null);

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

  function openAdd() {
    setActive(null);
    setModal("add");
  }

  function openEdit(s: Student) {
    setActive(s);
    setModal("edit");
  }

  function saveStudent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const classId = String(fd.get("classId") || classes[0]?.id);
    const cls = getClass(classId);
    const enrollmentDate =
      active?.enrollmentDate ?? new Date().toISOString().slice(0, 10);
    const payload: Student = {
      id: active?.id ?? `s${Date.now()}`,
      name: String(fd.get("name") || ""),
      nickname: String(fd.get("nickname") || ""),
      dateOfBirth: String(fd.get("dateOfBirth") || ""),
      gender: (String(fd.get("gender")) as "male" | "female") || "female",
      classId,
      status: (String(fd.get("status")) as StudentStatus) || "active",
      enrollmentDate,
      photoColor: active?.photoColor ?? "#F4A261",
      parents: active?.parents ?? [
        {
          id: `p${Date.now()}`,
          name: String(fd.get("parentName") || ""),
          relationship:
            (String(fd.get("relationship")) as "mother" | "father" | "guardian") ||
            "mother",
          phone: String(fd.get("parentPhone") || ""),
          email: String(fd.get("parentEmail") || ""),
        },
      ],
      classHistory:
        active?.classHistory ??
        (cls
          ? [
              {
                id: `ch-${Date.now()}`,
                classId: cls.id,
                className: cls.name,
                level: cls.level,
                teacherName: "—",
                startDate: enrollmentDate,
              },
            ]
          : []),
    };

    if (modal === "edit" && active) {
      setRows((prev) => prev.map((s) => (s.id === active.id ? { ...s, ...payload, parents: s.parents } : s)));
    } else {
      setRows((prev) => [payload, ...prev]);
    }
    setModal(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Student profiles and parent contacts
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Add student
        </button>
      </div>

      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search student or parent…"
      >
        <FilterSelect
          label="Class"
          value={classFilter}
          onChange={setClassFilter}
          options={[
            { value: "all", label: "All" },
            ...classes.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: "all", label: "All" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "alumni", label: "Alumni" },
          ]}
        />
      </SearchFilterBar>

      {filtered.length === 0 ? (
        <EmptyState message="No students match your filters." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-100 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Class</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Age</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((s) => {
                const cls = getClass(s.classId);
                const open = expanded === s.id;
                return (
                  <Fragment key={s.id}>
                    <tr className="hover:bg-neutral-50/80">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="flex size-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                            style={{ backgroundColor: s.photoColor }}
                          >
                            {s.nickname.slice(0, 1)}
                          </span>
                          <div>
                            <p className="font-medium">{s.name}</p>
                            <p className="text-xs text-neutral-500">{s.nickname}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-neutral-600 sm:table-cell">
                        {cls?.name}
                      </td>
                      <td className="hidden px-4 py-3 tabular-nums text-neutral-600 md:table-cell">
                        {ageFromDob(s.dateOfBirth)} yrs
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={s.status}
                          tone={s.status === "active" ? "success" : "neutral"}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2 text-xs font-medium">
                          <Link
                            href={`/dashboard/students/${s.id}`}
                            className="text-neutral-600 hover:text-neutral-900"
                          >
                            View
                          </Link>
                          <button type="button" onClick={() => openEdit(s)} className="text-neutral-600 hover:text-neutral-900">
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpanded(open ? null : s.id)}
                            className="text-neutral-600 hover:text-neutral-900"
                          >
                            {open ? "Hide" : "Parents"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {open ? (
                      <tr className="bg-neutral-50">
                        <td colSpan={5} className="px-4 py-4">
                          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                            Parents / guardians · enrolled {formatDate(s.enrollmentDate)}
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {s.parents.map((p) => (
                              <div key={p.id} className="rounded-md border border-neutral-200 bg-white p-3">
                                <p className="font-medium">{p.name}</p>
                                <p className="text-xs capitalize text-neutral-500">{p.relationship}</p>
                                <p className="mt-2 text-sm text-neutral-700">{p.phone}</p>
                                <p className="text-sm text-neutral-500">{p.email}</p>
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
      )}

      <Modal
        open={modal === "add" || modal === "edit"}
        onClose={() => setModal(null)}
        title={modal === "edit" ? "Edit student" : "Add student"}
      >
        <form onSubmit={saveStudent} className="space-y-3">
          <Field label="Full name">
            <input name="name" required defaultValue={active?.name} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nickname">
              <input name="nickname" required defaultValue={active?.nickname} className={inputClass} />
            </Field>
            <Field label="Date of birth">
              <input name="dateOfBirth" type="date" required defaultValue={active?.dateOfBirth} className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Gender">
              <select name="gender" defaultValue={active?.gender ?? "female"} className={inputClass}>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </Field>
            <Field label="Status">
              <select name="status" defaultValue={active?.status ?? "active"} className={inputClass}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="alumni">Alumni</option>
              </select>
            </Field>
          </div>
          <Field label="Class">
            <select name="classId" defaultValue={active?.classId ?? classes[0]?.id} className={inputClass}>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          {modal === "add" ? (
            <>
              <Field label="Parent name">
                <input name="parentName" required className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Relationship">
                  <select name="relationship" className={inputClass} defaultValue="mother">
                    <option value="mother">Mother</option>
                    <option value="father">Father</option>
                    <option value="guardian">Guardian</option>
                  </select>
                </Field>
                <Field label="Parent phone">
                  <input name="parentPhone" required className={inputClass} />
                </Field>
              </div>
              <Field label="Parent email">
                <input name="parentEmail" type="email" required className={inputClass} />
              </Field>
            </>
          ) : null}
          <ModalActions onCancel={() => setModal(null)} submitLabel={modal === "edit" ? "Update" : "Create"} />
        </form>
      </Modal>

    </div>
  );
}
