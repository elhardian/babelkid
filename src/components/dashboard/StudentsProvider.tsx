"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { students as seed } from "@/lib/mock-data";
import type { Student } from "@/lib/types";

const STORAGE_KEY = "babelkids.students.v1";

function readStorage(): Student[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Student[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStorage(rows: Student[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

const SERVER_SNAPSHOT = seed;
let store: Student[] = seed.map((s) => ({ ...s }));
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const saved = readStorage();
  if (saved) store = saved;
  else writeStorage(store);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  hydrate();
  queueMicrotask(() => {
    hydrate();
    listener();
  });
  return () => listeners.delete(listener);
}

function getSnapshot() {
  hydrate();
  return store;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

function setStore(next: Student[] | ((prev: Student[]) => Student[])) {
  hydrate();
  store = typeof next === "function" ? next(store) : next;
  writeStorage(store);
  emit();
}

export type StudentInput = Omit<Student, "id"> & { id?: string };

interface StudentsContextValue {
  students: Student[];
  upsert: (input: StudentInput) => Student;
  getById: (id: string) => Student | undefined;
}

const StudentsContext = createContext<StudentsContextValue | null>(null);

function upsertStudent(input: StudentInput): Student {
  let saved: Student | null = null;
  setStore((prev) => {
    if (input.id) {
      const next = prev.map((s) => {
        if (s.id !== input.id) return s;
        saved = { ...s, ...input, id: s.id };
        return saved!;
      });
      if (saved) return next;
    }
    saved = {
      id: input.id ?? `s-${Date.now()}`,
      name: input.name,
      nickname: input.nickname,
      dateOfBirth: input.dateOfBirth,
      gender: input.gender,
      classId: input.classId,
      status: input.status,
      enrollmentDate: input.enrollmentDate,
      parents: input.parents,
      photoColor: input.photoColor,
      allergies: input.allergies,
      notes: input.notes,
      classHistory: input.classHistory,
      documents: input.documents,
    };
    return [saved, ...prev];
  });
  return saved!;
}

export function StudentsProvider({ children }: { children: React.ReactNode }) {
  const students = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const upsert = useCallback((input: StudentInput) => upsertStudent(input), []);
  const getById = useCallback(
    (id: string) => students.find((s) => s.id === id),
    [students],
  );

  const value = useMemo(
    () => ({ students, upsert, getById }),
    [students, upsert, getById],
  );

  return (
    <StudentsContext.Provider value={value}>{children}</StudentsContext.Provider>
  );
}

export function useStudentsRegistry() {
  const ctx = useContext(StudentsContext);
  if (!ctx) {
    throw new Error("useStudentsRegistry must be used within StudentsProvider");
  }
  return ctx;
}

export function enrollStudentFromRegistration(input: StudentInput) {
  return upsertStudent(input);
}
