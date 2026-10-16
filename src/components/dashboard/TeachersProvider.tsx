"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  deleteTeacher,
  saveTeacher,
} from "@/app/actions/school-data";
import { registry } from "@/lib/runtime-registry";
import type { Teacher } from "@/lib/types";

export type TeacherInput = Omit<Teacher, "id" | "createdAt"> & {
  id?: string;
  createdAt?: string;
};

interface TeachersContextValue {
  teachers: Teacher[];
  staff: Teacher[];
  upsert: (input: TeacherInput) => Teacher;
  remove: (id: string) => void;
  getById: (id: string) => Teacher | undefined;
}

const TeachersContext = createContext<TeachersContextValue | null>(null);

export function TeachersProvider({
  children,
  initial = [],
}: {
  children: React.ReactNode;
  initial?: Teacher[];
}) {
  const [teachers, setTeachers] = useState<Teacher[]>(initial);
  const [, start] = useTransition();

  useEffect(() => {
    setTeachers(initial);
  }, [initial]);

  registry.teachers = teachers;

  const upsert = useCallback((input: TeacherInput) => {
    const optimistic: Teacher = {
      id: input.id ?? `t-${Date.now()}`,
      name: input.name,
      email: input.email,
      phone: input.phone,
      role: input.role,
      jabatan: input.jabatan,
      notes: input.notes,
      createdAt: input.createdAt ?? new Date().toISOString().slice(0, 10),
    };
    setTeachers((prev) => {
      const exists = prev.some((t) => t.id === optimistic.id);
      return exists
        ? prev.map((t) => (t.id === optimistic.id ? { ...t, ...optimistic } : t))
        : [optimistic, ...prev];
    });
    start(async () => {
      const saved = await saveTeacher(input);
      setTeachers((prev) => {
        const withoutTemp = prev.filter(
          (t) => t.id !== optimistic.id && t.id !== saved.id,
        );
        return [saved, ...withoutTemp];
      });
    });
    return optimistic;
  }, []);

  const remove = useCallback((id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    start(async () => {
      await deleteTeacher(id);
    });
  }, []);

  const getById = useCallback(
    (id: string) => teachers.find((t) => t.id === id),
    [teachers],
  );

  const staff = useMemo(
    () =>
      teachers.filter(
        (t) => t.role === "teacher" || t.role === "admin" || t.role === "owner",
      ),
    [teachers],
  );

  const value = useMemo(
    () => ({ teachers, staff, upsert, remove, getById }),
    [teachers, staff, upsert, remove, getById],
  );

  return (
    <TeachersContext.Provider value={value}>{children}</TeachersContext.Provider>
  );
}

export function useTeachersRegistry() {
  const ctx = useContext(TeachersContext);
  if (!ctx) {
    throw new Error("useTeachersRegistry must be used within TeachersProvider");
  }
  return ctx;
}

export function useTeachersStore() {
  return useTeachersRegistry();
}

export function getTeacherFromStore(id: string) {
  return registry.teachers.find((t) => t.id === id);
}
