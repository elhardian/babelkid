"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { teachers as seed } from "@/lib/mock-data";
import type { Teacher } from "@/lib/types";

let store: Teacher[] = [...seed];
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return store;
}

function setStore(next: Teacher[] | ((prev: Teacher[]) => Teacher[])) {
  store = typeof next === "function" ? next(store) : next;
  emit();
}

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

function upsertTeacher(input: TeacherInput): Teacher {
  let saved: Teacher | null = null;
  setStore((prev) => {
    if (input.id) {
      const next = prev.map((t) => {
        if (t.id !== input.id) return t;
        saved = {
          ...t,
          name: input.name,
          email: input.email,
          phone: input.phone,
          role: input.role,
          notes: input.notes,
        };
        return saved!;
      });
      if (saved) return next;
    }
    saved = {
      id: input.id ?? `t-${Date.now()}`,
      name: input.name,
      email: input.email,
      phone: input.phone,
      role: input.role,
      notes: input.notes,
      createdAt: input.createdAt ?? new Date().toISOString().slice(0, 10),
    };
    return [saved, ...prev];
  });
  return saved!;
}

export function TeachersProvider({ children }: { children: React.ReactNode }) {
  const teachers = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const upsert = useCallback((input: TeacherInput) => upsertTeacher(input), []);

  const remove = useCallback((id: string) => {
    setStore((prev) => prev.filter((t) => t.id !== id));
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

/** Same store without requiring provider (parents / helpers) */
export function useTeachersStore() {
  const teachers = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    teachers,
    staff: teachers.filter(
      (t) => t.role === "teacher" || t.role === "admin" || t.role === "owner",
    ),
    getById: (id: string) => teachers.find((t) => t.id === id),
    upsert: upsertTeacher,
    remove: (id: string) => {
      setStore((prev) => prev.filter((t) => t.id !== id));
    },
  };
}

/** Live lookup — mirrors mock getTeacher but reads mutable store */
export function getTeacherFromStore(id: string) {
  return store.find((t) => t.id === id);
}
