"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { students } from "@/lib/mock-data";
import { rosterParentProfiles } from "@/lib/seed/roster";
import type { ParentProfile } from "@/lib/types";

function seedFromStudents(): ParentProfile[] {
  return [...rosterParentProfiles].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
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
