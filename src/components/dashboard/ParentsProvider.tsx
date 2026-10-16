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
import { deleteParent, saveParent } from "@/app/actions/school-data";
import { registry } from "@/lib/runtime-registry";
import type { ParentProfile } from "@/lib/types";

type ParentInput = Omit<ParentProfile, "id" | "createdAt"> & { id?: string };
export type { ParentInput };

interface ParentsContextValue {
  parents: ParentProfile[];
  upsert: (input: ParentInput) => ParentProfile;
  remove: (id: string) => void;
  getById: (id: string) => ParentProfile | undefined;
}

const ParentsContext = createContext<ParentsContextValue | null>(null);

export function ParentsProvider({
  children,
  initial = [],
}: {
  children: React.ReactNode;
  initial?: ParentProfile[];
}) {
  const [parents, setParents] = useState<ParentProfile[]>(initial);
  const [, start] = useTransition();

  useEffect(() => {
    setParents(initial);
  }, [initial]);

  registry.parents = parents;

  const upsert = useCallback((input: ParentInput) => {
    const optimistic: ParentProfile = {
      id: input.id ?? `p-${Date.now()}`,
      name: input.name,
      relationship: input.relationship,
      phone: input.phone,
      email: input.email,
      address: input.address,
      occupation: input.occupation,
      notes: input.notes,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setParents((prev) => {
      const byId = prev.find((p) => p.id === optimistic.id);
      const byEmail = prev.find(
        (p) => p.email.toLowerCase() === input.email.trim().toLowerCase(),
      );
      if (byId) {
        return prev.map((p) => (p.id === byId.id ? { ...p, ...optimistic } : p));
      }
      if (byEmail) {
        return prev.map((p) =>
          p.id === byEmail.id ? { ...byEmail, ...optimistic, id: byEmail.id } : p,
        );
      }
      return [optimistic, ...prev];
    });
    start(async () => {
      const saved = await saveParent(input);
      setParents((prev) => {
        const rest = prev.filter(
          (p) =>
            p.id !== optimistic.id &&
            p.id !== saved.id &&
            p.email.toLowerCase() !== saved.email.toLowerCase(),
        );
        return [saved, ...rest];
      });
    });
    return optimistic;
  }, []);

  const remove = useCallback((id: string) => {
    setParents((prev) => prev.filter((p) => p.id !== id));
    start(async () => {
      await deleteParent(id);
    });
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

export function upsertParentFromStore(input: ParentInput) {
  const optimistic: ParentProfile = {
    id: input.id ?? `p-${Date.now()}`,
    name: input.name,
    relationship: input.relationship,
    phone: input.phone,
    email: input.email,
    address: input.address,
    occupation: input.occupation,
    notes: input.notes,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  registry.parents = [
    optimistic,
    ...registry.parents.filter(
      (p) =>
        p.id !== optimistic.id &&
        p.email.toLowerCase() !== optimistic.email.toLowerCase(),
    ),
  ];
  void saveParent(input).then((saved) => {
    registry.parents = [
      saved,
      ...registry.parents.filter(
        (p) =>
          p.id !== saved.id &&
          p.id !== optimistic.id &&
          p.email.toLowerCase() !== saved.email.toLowerCase(),
      ),
    ];
  });
  return optimistic;
}

export function useParentsStore() {
  return useParentsRegistry();
}
