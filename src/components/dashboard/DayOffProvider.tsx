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
import { deleteDayOff, saveDayOff } from "@/app/actions/school-data";
import { registry } from "@/lib/runtime-registry";
import type { DayOffType, SchoolDayOff } from "@/lib/types";

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

export function DayOffProvider({
  children,
  initial = [],
}: {
  children: React.ReactNode;
  initial?: SchoolDayOff[];
}) {
  const [dayOffs, setDayOffs] = useState<SchoolDayOff[]>(initial);
  const [, start] = useTransition();

  useEffect(() => {
    setDayOffs(initial);
  }, [initial]);

  registry.dayOffs = dayOffs;

  const upsertDayOff = useCallback(
    (input: {
      id?: string;
      date: string;
      title: string;
      description?: string;
      type: DayOffType;
    }) => {
      const optimistic: SchoolDayOff = {
        id: input.id ?? `off-${Date.now()}`,
        date: input.date,
        title: input.title,
        description: input.description,
        type: input.type,
      };
      setDayOffs((prev) => {
        const existing = input.id
          ? prev.find((o) => o.id === input.id)
          : prev.find((o) => o.date === input.date);
        if (existing) {
          return prev.map((o) =>
            o.id === existing.id ? { ...existing, ...optimistic, id: existing.id } : o,
          );
        }
        return [optimistic, ...prev];
      });
      start(async () => {
        const saved = await saveDayOff(input);
        setDayOffs((prev) => {
          const rest = prev.filter(
            (o) => o.id !== optimistic.id && o.id !== saved.id && o.date !== saved.date,
          );
          return [saved, ...rest];
        });
      });
    },
    [],
  );

  const removeDayOff = useCallback((id: string) => {
    setDayOffs((prev) => prev.filter((o) => o.id !== id));
    start(async () => {
      await deleteDayOff(id);
    });
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

export function useDayOffsStore() {
  return {
    dayOffs: registry.dayOffs,
    getByDate: (date: string) => registry.dayOffs.find((o) => o.date === date),
  };
}
