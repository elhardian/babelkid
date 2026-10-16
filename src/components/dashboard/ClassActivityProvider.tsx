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
import { deleteActivity, saveActivity } from "@/app/actions/school-data";
import { registry } from "@/lib/runtime-registry";
import type { ClassActivity } from "@/lib/types";

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

export function ClassActivityProvider({
  children,
  initial = [],
}: {
  children: React.ReactNode;
  initial?: ClassActivity[];
}) {
  const [activities, setActivities] = useState<ClassActivity[]>(initial);
  const [, start] = useTransition();

  useEffect(() => {
    setActivities(initial);
  }, [initial]);

  registry.activities = activities;

  const upsert = useCallback((input: ClassActivityInput) => {
    const optimistic: ClassActivity = {
      id: input.id ?? `ca-${Date.now()}`,
      classId: input.classId,
      title: input.title,
      description: input.description,
      date: input.date,
      teacherId: input.teacherId,
      teacherName: input.teacherName,
      images: input.images,
      videoUrl: input.videoUrl,
      location: input.location,
    };
    setActivities((prev) => {
      const exists = prev.some((a) => a.id === optimistic.id);
      return exists
        ? prev.map((a) => (a.id === optimistic.id ? optimistic : a))
        : [optimistic, ...prev];
    });
    start(async () => {
      const saved = await saveActivity(input);
      setActivities((prev) => {
        const rest = prev.filter(
          (a) => a.id !== optimistic.id && a.id !== saved.id,
        );
        return [saved, ...rest];
      });
    });
    return optimistic;
  }, []);

  const remove = useCallback((id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    start(async () => {
      await deleteActivity(id);
    });
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
        .sort(
          (a, b) =>
            b.date.localeCompare(a.date) || a.title.localeCompare(b.title),
        ),
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

export function useClassActivitiesStore() {
  return {
    activities: registry.activities,
    forClass: (classId: string) =>
      registry.activities
        .filter((a) => a.classId === classId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    getById: (id: string) => registry.activities.find((a) => a.id === id),
  };
}

export function upsertClassActivity(input: ClassActivityInput) {
  const optimistic: ClassActivity = {
    id: input.id ?? `ca-${Date.now()}`,
    ...input,
  };
  registry.activities = [
    optimistic,
    ...registry.activities.filter((a) => a.id !== optimistic.id),
  ];
  void saveActivity(input);
  return optimistic;
}
