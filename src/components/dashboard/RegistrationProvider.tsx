"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { RegistrationApplication, RegistrationStatus } from "@/lib/types";

const seed: RegistrationApplication[] = [
  {
    id: "reg-demo-1",
    status: "pending",
    submittedAt: "2026-09-14T08:30:00+07:00",
    parent: {
      name: "Dewi Lestari",
      relationship: "mother",
      phone: "081234567890",
      email: "dewi.lestari@email.com",
      address: "Jl. Melati No. 12, Bandung",
      occupation: "Designer",
    },
    child: {
      name: "Nina Lestari",
      nickname: "Nina",
      dateOfBirth: "2022-04-18",
      gender: "female",
      preferredClassId: "c1",
      allergies: "Kacang",
    },
  },
];

let store: RegistrationApplication[] = [...seed];
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
  next:
    | RegistrationApplication[]
    | ((prev: RegistrationApplication[]) => RegistrationApplication[]),
) {
  store = typeof next === "function" ? next(store) : next;
  emit();
}

interface RegistrationContextValue {
  applications: RegistrationApplication[];
  submit: (
    input: Omit<RegistrationApplication, "id" | "status" | "submittedAt">,
  ) => RegistrationApplication;
  updateStatus: (id: string, status: RegistrationStatus, notes?: string) => void;
  pendingCount: number;
}

const RegistrationContext = createContext<RegistrationContextValue | null>(
  null,
);

export function RegistrationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const applications = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );

  const submit = useCallback(
    (
      input: Omit<RegistrationApplication, "id" | "status" | "submittedAt">,
    ) => {
      const row: RegistrationApplication = {
        ...input,
        id: `reg-${Date.now()}`,
        status: "pending",
        submittedAt: new Date().toISOString(),
      };
      setStore((prev) => [row, ...prev]);
      return row;
    },
    [],
  );

  const updateStatus = useCallback(
    (id: string, status: RegistrationStatus, notes?: string) => {
      setStore((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status, notes: notes ?? a.notes }
            : a,
        ),
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      applications,
      submit,
      updateStatus,
      pendingCount: applications.filter(
        (a) => a.status === "pending" || a.status === "reviewing",
      ).length,
    }),
    [applications, submit, updateStatus],
  );

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistrations() {
  const ctx = useContext(RegistrationContext);
  if (!ctx) {
    throw new Error("useRegistrations must be used within RegistrationProvider");
  }
  return ctx;
}

/** Public form can submit without provider — writes to same module store */
export function submitRegistration(
  input: Omit<RegistrationApplication, "id" | "status" | "submittedAt">,
) {
  const row: RegistrationApplication = {
    ...input,
    id: `reg-${Date.now()}`,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
  setStore((prev) => [row, ...prev]);
  return row;
}

export function useRegistrationStore() {
  const applications = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );
  return {
    applications,
    pendingCount: applications.filter(
      (a) => a.status === "pending" || a.status === "reviewing",
    ).length,
    submit: submitRegistration,
  };
}
