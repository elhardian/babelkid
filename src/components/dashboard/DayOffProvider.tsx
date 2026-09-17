"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { schoolDayOffs as initialDayOffs } from "@/lib/mock-data";
import type { DayOffType, SchoolDayOff } from "@/lib/types";

let store: SchoolDayOff[] = [...initialDayOffs];
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

function setStore(next: SchoolDayOff[] | ((prev: SchoolDayOff[]) => SchoolDayOff[])) {
  store = typeof next === "function" ? next(store) : next;
  emit();
}

interface DayOffContextValue {
  dayOffs: SchoolDayOff[];
  upsertDayOff: (input: {
    id?: string;
    date: string;
    title: string;
    description?: string;
    type: DayOffType;
  }) => void;
  removeDayOff: (id: string) => void;
  getByDate: (date: string) => SchoolDayOff | undefined;
}

const DayOffContext = createContext<DayOffContextValue | null>(null);

export function DayOffProvider({ children }: { children: React.ReactNode }) {
  const dayOffs = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const upsertDayOff = useCallback(
    (input: {
      id?: string;
      date: string;
      title: string;
      description?: string;
      type: DayOffType;
    }) => {
      setStore((prev) => {
        const existing = input.id
          ? prev.find((o) => o.id === input.id)
          : prev.find((o) => o.date === input.date);
        if (existing) {
          return prev.map((o) =>
            o.id === existing.id
              ? {
                  ...o,
                  date: input.date,
                  title: input.title,
                  description: input.description,
                  type: input.type,
                }
              : o,
          );
        }
        return [
          {
            id: `off-${Date.now()}`,
            date: input.date,
            title: input.title,
            description: input.description,
            type: input.type,
          },
          ...prev,
        ];
      });
    },
    [],
  );

  const removeDayOff = useCallback((id: string) => {
    setStore((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const getByDate = useCallback(
    (date: string) => dayOffs.find((o) => o.date === date),
    [dayOffs],
  );

  const value = useMemo(
    () => ({ dayOffs, upsertDayOff, removeDayOff, getByDate }),
    [dayOffs, upsertDayOff, removeDayOff, getByDate],
  );

  return (
    <DayOffContext.Provider value={value}>{children}</DayOffContext.Provider>
  );
}

export function useDayOffs() {
  const ctx = useContext(DayOffContext);
  if (!ctx) throw new Error("useDayOffs must be used within DayOffProvider");
  return ctx;
}

/** Read-only hook for parents — syncs with dashboard day-off store */
export function useDayOffsStore() {
  const dayOffs = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    dayOffs,
    getByDate: (date: string) => dayOffs.find((o) => o.date === date),
  };
}
