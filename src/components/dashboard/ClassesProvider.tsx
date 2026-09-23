"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { classes as seed } from "@/lib/mock-data";
import type { SchoolClass } from "@/lib/types";

let store: SchoolClass[] = seed.map((c) => ({ ...c }));
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

function setStore(
  next: SchoolClass[] | ((prev: SchoolClass[]) => SchoolClass[]),
) {
  store = typeof next === "function" ? next(store) : next;
  emit();
}

export type ClassInput = Omit<SchoolClass, "id"> & { id?: string };

interface ClassesContextValue {
  classes: SchoolClass[];
  upsert: (input: ClassInput) => SchoolClass;
  remove: (id: string) => void;
  getById: (id: string) => SchoolClass | undefined;
  assignTeacher: (classId: string, teacherId: string) => void;
  classesForTeacher: (teacherId: string) => SchoolClass[];
}

const ClassesContext = createContext<ClassesContextValue | null>(null);

function upsertClass(input: ClassInput): SchoolClass {
  let saved: SchoolClass | null = null;
  setStore((prev) => {
    if (input.id) {
      const next = prev.map((c) => {
        if (c.id !== input.id) return c;
        saved = {
          ...c,
          name: input.name,
          level: input.level,
          teacherId: input.teacherId,
          capacity: input.capacity,
          room: input.room,
          schedule: input.schedule,
          ageMinYears: input.ageMinYears,
          ageMaxYears: input.ageMaxYears,
        };
        return saved!;
      });
      if (saved) return next;
    }
    saved = {
      id: input.id ?? `c-${Date.now()}`,
      name: input.name,
      level: input.level,
      teacherId: input.teacherId,
      capacity: input.capacity,
      room: input.room,
      schedule: input.schedule,
      ageMinYears: input.ageMinYears,
      ageMaxYears: input.ageMaxYears,
    };
    return [saved, ...prev];
  });
  return saved!;
}

export function ClassesProvider({ children }: { children: React.ReactNode }) {
  const classes = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const upsert = useCallback((input: ClassInput) => upsertClass(input), []);

  const remove = useCallback((id: string) => {
    setStore((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getById = useCallback(
    (id: string) => classes.find((c) => c.id === id),
    [classes],
  );

  const assignTeacher = useCallback((classId: string, teacherId: string) => {
    setStore((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, teacherId } : c)),
    );
  }, []);

  const classesForTeacher = useCallback(
    (teacherId: string) => classes.filter((c) => c.teacherId === teacherId),
    [classes],
  );

  const value = useMemo(
    () => ({
      classes,
      upsert,
      remove,
      getById,
      assignTeacher,
      classesForTeacher,
    }),
    [classes, upsert, remove, getById, assignTeacher, classesForTeacher],
  );

  return (
    <ClassesContext.Provider value={value}>{children}</ClassesContext.Provider>
  );
}

export function useClassesRegistry() {
  const ctx = useContext(ClassesContext);
  if (!ctx) {
    throw new Error("useClassesRegistry must be used within ClassesProvider");
  }
  return ctx;
}

export function useClassesStore() {
  const classes = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    classes,
    getById: (id: string) => classes.find((c) => c.id === id),
    upsert: upsertClass,
    assignTeacher: (classId: string, teacherId: string) => {
      setStore((prev) =>
        prev.map((c) => (c.id === classId ? { ...c, teacherId } : c)),
      );
    },
    classesForTeacher: (teacherId: string) =>
      classes.filter((c) => c.teacherId === teacherId),
  };
}
