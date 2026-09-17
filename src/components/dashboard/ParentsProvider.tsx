"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { students } from "@/lib/mock-data";
import type { ParentProfile } from "@/lib/types";

function seedFromStudents(): ParentProfile[] {
  const map = new Map<string, ParentProfile>();
  for (const s of students) {
    for (const p of s.parents) {
      if (map.has(p.id)) continue;
      map.set(p.id, {
        ...p,
        address: undefined,
        occupation: undefined,
        notes: undefined,
        createdAt: s.enrollmentDate,
      });
    }
  }
  // enrich known demo parents
  const sari = map.get("p1");
  if (sari) {
    sari.address = "Jl. Cendana No. 8, Bandung";
    sari.occupation = "Ibu rumah tangga";
  }
  const budi = map.get("p1b");
  if (budi) {
    budi.address = "Jl. Cendana No. 8, Bandung";
    budi.occupation = "Karyawan swasta";
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

let store: ParentProfile[] = seedFromStudents();
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
  next: ParentProfile[] | ((prev: ParentProfile[]) => ParentProfile[]),
) {
  store = typeof next === "function" ? next(store) : next;
  emit();
}

type ParentInput = Omit<ParentProfile, "id" | "createdAt"> & { id?: string };

interface ParentsContextValue {
  parents: ParentProfile[];
  upsert: (input: ParentInput) => ParentProfile;
  remove: (id: string) => void;
  getById: (id: string) => ParentProfile | undefined;
}

const ParentsContext = createContext<ParentsContextValue | null>(null);

export function ParentsProvider({ children }: { children: React.ReactNode }) {
  const parents = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const upsert = useCallback((input: ParentInput) => {
    let saved: ParentProfile | null = null;
    setStore((prev) => {
      if (input.id) {
        const next = prev.map((p) => {
          if (p.id !== input.id) return p;
          saved = {
            ...p,
            name: input.name,
            relationship: input.relationship,
            phone: input.phone,
            email: input.email,
            address: input.address,
            occupation: input.occupation,
            notes: input.notes,
          };
          return saved!;
        });
        if (saved) return next;
      }
      saved = {
        id: `p-${Date.now()}`,
        name: input.name,
        relationship: input.relationship,
        phone: input.phone,
        email: input.email,
        address: input.address,
        occupation: input.occupation,
        notes: input.notes,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      return [saved, ...prev];
    });
    return saved!;
  }, []);

  const remove = useCallback((id: string) => {
    setStore((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getById = useCallback(
    (id: string) => parents.find((p) => p.id === id),
    [parents],
  );

  const value = useMemo(
    () => ({ parents, upsert, remove, getById }),
    [parents, upsert, remove, getById],
  );

  return (
    <ParentsContext.Provider value={value}>{children}</ParentsContext.Provider>
  );
}

export function useParentsRegistry() {
  const ctx = useContext(ParentsContext);
  if (!ctx) {
    throw new Error("useParentsRegistry must be used within ParentsProvider");
  }
  return ctx;
}

export function studentsForParent(parentId: string, email: string) {
  return students.filter((s) =>
    s.parents.some((p) => p.id === parentId || p.email === email),
  );
}
