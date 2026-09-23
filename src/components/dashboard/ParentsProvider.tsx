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
  const extra: ParentProfile[] = [
    {
      id: "p-demo-1",
      name: "Rina Wijaya",
      relationship: "mother",
      phone: "081298765432",
      email: "rina.wijaya@email.com",
      address: "Jl. Melati No. 5, Pangkalpinang",
      occupation: "Guru",
      createdAt: "2025-06-01",
    },
    {
      id: "p-demo-2",
      name: "Andi Pratama",
      relationship: "father",
      phone: "081355512345",
      email: "andi.pratama@email.com",
      address: "Jl. Merdeka No. 21, Pangkalpinang",
      occupation: "Wiraswasta",
      createdAt: "2025-08-12",
    },
    {
      id: "p-demo-3",
      name: "Siti Nurhaliza",
      relationship: "guardian",
      phone: "082112223333",
      email: "siti.nur@email.com",
      address: "Komplek Bumi Asri Blok B2",
      occupation: "Pegawai negeri",
      notes: "Wali dari sepupu",
      createdAt: "2026-01-20",
    },
  ];
  for (const p of extra) {
    if (!map.has(p.id)) map.set(p.id, p);
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
export type { ParentInput };

function upsertParent(input: ParentInput): ParentProfile {
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
    // match existing by email to avoid duplicates
    const byEmail = prev.find(
      (p) =>
        p.email.toLowerCase() === input.email.trim().toLowerCase() &&
        input.email.trim(),
    );
    if (byEmail) {
      saved = {
        ...byEmail,
        name: input.name,
        relationship: input.relationship,
        phone: input.phone,
        email: input.email,
        address: input.address ?? byEmail.address,
        occupation: input.occupation ?? byEmail.occupation,
        notes: input.notes ?? byEmail.notes,
      };
      return prev.map((p) => (p.id === byEmail.id ? saved! : p));
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
}

export function upsertParentFromStore(input: ParentInput) {
  return upsertParent(input);
}

interface ParentsContextValue {
  parents: ParentProfile[];
  upsert: (input: ParentInput) => ParentProfile;
  remove: (id: string) => void;
  getById: (id: string) => ParentProfile | undefined;
}

const ParentsContext = createContext<ParentsContextValue | null>(null);

export function ParentsProvider({ children }: { children: React.ReactNode }) {
  const parents = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const upsert = useCallback((input: ParentInput) => upsertParent(input), []);

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

/** Read/write without React tree — same module store as ParentsProvider */
export function useParentsStore() {
  const parents = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    parents,
    getById: (id: string) => parents.find((p) => p.id === id),
    upsert: upsertParent,
    remove: (id: string) => {
      setStore((prev) => prev.filter((p) => p.id !== id));
    },
  };
}

export function studentsForParent(parentId: string, email: string) {
  return students.filter((s) =>
    s.parents.some((p) => p.id === parentId || p.email === email),
  );
}
