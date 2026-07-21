"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  kasAccountFromPaymentMethod,
} from "@/lib/format";
import { getKasBalance, getKasBalances, kasEntries as initial } from "@/lib/mock-data";
import type { KasAccount, KasEntry, PaymentMethod, TuitionRecord } from "@/lib/types";
import { getStudent } from "@/lib/mock-data";

interface KasContextValue {
  entries: KasEntry[];
  balances: { cash: number; bank: number; total: number };
  addEntry: (entry: Omit<KasEntry, "id"> & { id?: string }) => void;
  /** Post tuition into cash/bank kas when marked paid / approved */
  postTuitionToKas: (tuition: TuitionRecord, method?: PaymentMethod) => boolean;
}

const KasContext = createContext<KasContextValue | null>(null);

export function KasProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<KasEntry[]>(initial);

  const balances = useMemo(() => getKasBalances(entries), [entries]);

  const addEntry = useCallback(
    (entry: Omit<KasEntry, "id"> & { id?: string }) => {
      setEntries((prev) => [
        { ...entry, id: entry.id ?? `k${Date.now()}` },
        ...prev,
      ]);
    },
    [],
  );

  const postTuitionToKas = useCallback(
    (tuition: TuitionRecord, method?: PaymentMethod) => {
      const payMethod = method ?? tuition.paymentMethod ?? "transfer";
      const account: KasAccount = kasAccountFromPaymentMethod(payMethod);

      let posted = false;
      setEntries((prev) => {
        if (prev.some((e) => e.tuitionId === tuition.id && e.source === "tuition")) {
          return prev;
        }
        const student = getStudent(tuition.studentId);
        const entry: KasEntry = {
          id: `k-tu-${tuition.id}-${Date.now()}`,
          date: tuition.paidAt ?? new Date().toISOString().slice(0, 10),
          type: "in",
          account,
          source: "tuition",
          amount: tuition.amount,
          note: `Tuition ${tuition.month} — ${student?.name ?? tuition.studentId} (${payMethod})`,
          recordedBy: tuition.recordedBy ?? "Maya Santoso",
          tuitionId: tuition.id,
        };
        posted = true;
        return [entry, ...prev];
      });
      return posted;
    },
    [],
  );

  const value: KasContextValue = {
    entries,
    balances,
    addEntry,
    postTuitionToKas,
  };

  return <KasContext.Provider value={value}>{children}</KasContext.Provider>;
}

export function useKas() {
  const ctx = useContext(KasContext);
  if (!ctx) {
    throw new Error("useKas must be used within KasProvider");
  }
  return ctx;
}

export function useKasOptional() {
  return useContext(KasContext);
}

export { getKasBalance };
