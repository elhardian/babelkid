"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { classActivities as seed } from "@/lib/mock-data";
import type { ClassActivity } from "@/lib/types";

let store: ClassActivity[] = [...seed];
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
  next: ClassActivity[] | ((prev: ClassActivity[]) => ClassActivity[]),
) {
  store = typeof next === "function" ? next(store) : next;
  emit();
}

export type ClassActivityInput = Omit<ClassActivity, "id"> & { id?: string };

interface ClassActivityContextValue {
  activities: ClassActivity[];
  upsert: (input: ClassActivityInput) => ClassActivity;
  remove: (id: string) => void;
  forClass: (classId: string) => ClassActivity[];
  forClassDate: (classId: string, date: string) => ClassActivity[];
  forClassMonth: (classId: string, monthPrefix: string) => ClassActivity[];
  getById: (id: string) => ClassActivity | undefined;
}

const ClassActivityContext = createContext<ClassActivityContextValue | null>(
  null,
);

function upsertActivity(input: ClassActivityInput): ClassActivity {
  let result: ClassActivity;
  setStore((prev) => {
    if (input.id) {
      const existing = prev.find((a) => a.id === input.id);
      if (existing) {
        result = {
          ...existing,
          classId: input.classId,
          title: input.title,
          description: input.description,
          date: input.date,
          teacherName: input.teacherName,
          images: input.images,
          videoUrl: input.videoUrl,
          location: input.location,
        };
        return prev.map((a) => (a.id === existing.id ? result : a));
      }
    }
    result = {
      id: input.id ?? `ca-${Date.now()}`,
      classId: input.classId,
      title: input.title,
      description: input.description,
      date: input.date,
      teacherName: input.teacherName,
      images: input.images,
      videoUrl: input.videoUrl,
      location: input.location,
    };
    return [result, ...prev];
  });
  return result!;
}

export function ClassActivityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const activities = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );

  const upsert = useCallback((input: ClassActivityInput) => {
    return upsertActivity(input);
  }, []);

  const remove = useCallback((id: string) => {
    setStore((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const forClass = useCallback(
    (classId: string) =>
      activities
        .filter((a) => a.classId === classId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [activities],
  );

  const forClassDate = useCallback(
    (classId: string, date: string) =>
      activities
        .filter((a) => a.classId === classId && a.date === date)
        .sort((a, b) => a.title.localeCompare(b.title)),
    [activities],
  );

  const forClassMonth = useCallback(
    (classId: string, monthPrefix: string) =>
      activities
        .filter(
          (a) => a.classId === classId && a.date.startsWith(monthPrefix),
        )
        .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title)),
    [activities],
  );

  const getById = useCallback(
    (id: string) => activities.find((a) => a.id === id),
    [activities],
  );

  const value = useMemo(
    () => ({
      activities,
      upsert,
      remove,
      forClass,
      forClassDate,
      forClassMonth,
      getById,
    }),
    [activities, upsert, remove, forClass, forClassDate, forClassMonth, getById],
  );

  return (
    <ClassActivityContext.Provider value={value}>
      {children}
    </ClassActivityContext.Provider>
  );
}

export function useClassActivities() {
  const ctx = useContext(ClassActivityContext);
  if (!ctx) {
    throw new Error(
      "useClassActivities must be used within ClassActivityProvider",
    );
  }
  return ctx;
}

/** Parents / shared — syncs with dashboard store without requiring provider */
export function useClassActivitiesStore() {
  const activities = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
  return {
    activities,
    forClass: (classId: string) =>
      activities
        .filter((a) => a.classId === classId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    getById: (id: string) => activities.find((a) => a.id === id),
  };
}

export function upsertClassActivity(input: ClassActivityInput) {
  return upsertActivity(input);
}
