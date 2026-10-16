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
  deleteClass,
  saveClass,
  saveClassTeacher,
} from "@/app/actions/school-data";
import { registry } from "@/lib/runtime-registry";
import type { SchoolClass } from "@/lib/types";

export type ClassInput = Omit<SchoolClass, "id"> & { id?: string };

interface ClassesContextValue {
  classes: SchoolClass[];
  upsert: (input: ClassInput) => SchoolClass;
  remove: (id: string) => void;
  assignTeacher: (classId: string, teacherId: string) => void;
  classesForTeacher: (teacherId: string) => SchoolClass[];
  getById: (id: string) => SchoolClass | undefined;
}

const ClassesContext = createContext<ClassesContextValue | null>(null);

export function ClassesProvider({
  children,
  initial = [],
}: {
  children: React.ReactNode;
  initial?: SchoolClass[];
}) {
  const [classes, setClasses] = useState<SchoolClass[]>(initial);
  const [, start] = useTransition();

  useEffect(() => {
    setClasses(initial);
  }, [initial]);

  registry.classes = classes;

  const upsert = useCallback((input: ClassInput) => {
    const optimistic: SchoolClass = {
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
    setClasses((prev) => {
      const exists = prev.some((c) => c.id === optimistic.id);
      return exists
        ? prev.map((c) => (c.id === optimistic.id ? optimistic : c))
        : [optimistic, ...prev];
    });
    start(async () => {
      const saved = await saveClass(input);
      setClasses((prev) => {
        const rest = prev.filter((c) => c.id !== optimistic.id && c.id !== saved.id);
        return [saved, ...rest];
      });
    });
    return optimistic;
  }, []);

  const remove = useCallback((id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    start(async () => {
      await deleteClass(id);
    });
  }, []);

  const assignTeacher = useCallback((classId: string, teacherId: string) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, teacherId } : c)),
    );
    start(async () => {
      const saved = await saveClassTeacher(classId, teacherId);
      setClasses((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
    });
  }, []);

  const classesForTeacher = useCallback(
    (teacherId: string) => classes.filter((c) => c.teacherId === teacherId),
    [classes],
  );

  const getById = useCallback(
    (id: string) => classes.find((c) => c.id === id),
    [classes],
  );

  const value = useMemo(
    () => ({
      classes,
      upsert,
      remove,
      assignTeacher,
      classesForTeacher,
      getById,
    }),
    [classes, upsert, remove, assignTeacher, classesForTeacher, getById],
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
