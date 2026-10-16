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
import { saveKasEntry } from "@/app/actions/school-data";
import { kasAccountFromPaymentMethod } from "@/lib/format";
import {
  getKasBalance,
  getKasBalances,
  getStudent,
  registry,
} from "@/lib/runtime-registry";
import type {
  KasAccount,
  KasEntry,
  PaymentMethod,
  TuitionRecord,
} from "@/lib/types";

interface KasContextValue {
  entries: KasEntry[];
  balances: { cash: number; bank: number; total: number };
  addEntry: (entry: Omit<KasEntry, "id"> & { id?: string }) => void;
  postTuitionToKas: (tuition: TuitionRecord, method?: PaymentMethod) => boolean;
}

const KasContext = createContext<KasContextValue | null>(null);

export function KasProvider({
  children,
  initial = [],
}: {
  children: React.ReactNode;
  initial?: KasEntry[];
}) {
  const [entries, setEntries] = useState<KasEntry[]>(initial);
  const [, start] = useTransition();

  useEffect(() => {
    setEntries(initial);
  }, [initial]);

  registry.kas = entries;

  const balances = useMemo(() => getKasBalances(entries), [entries]);

  const addEntry = useCallback(
    (entry: Omit<KasEntry, "id"> & { id?: string }) => {
      const row: KasEntry = { ...entry, id: entry.id ?? `k${Date.now()}` };
      setEntries((prev) => [row, ...prev]);
      start(async () => {
        const saved = await saveKasEntry(row);
        setEntries((prev) => {
          const rest = prev.filter((e) => e.id !== row.id && e.id !== saved.id);
          return [saved, ...rest];
        });
      });
    },
    [],
  );

  const postTuitionToKas = useCallback(
    (tuition: TuitionRecord, method?: PaymentMethod) => {
      const payMethod = method ?? tuition.paymentMethod ?? "transfer";
      const account: KasAccount = kasAccountFromPaymentMethod(payMethod);

      let posted = false;
      setEntries((prev) => {
        if (
          prev.some((e) => e.tuitionId === tuition.id && e.source === "tuition")
        ) {
          return prev;
        }
        const student = getStudent(tuition.studentId);
        const entry: KasEntry = {
          id: `k-tu-${tuition.id}-${Date.now()}`,
          date: (tuition.paidAt ?? new Date().toISOString()).slice(0, 10),
          type: "in",
          account,
          source: "tuition",
          amount: tuition.amount,
          note: `Tuition ${tuition.month} — ${student?.name ?? tuition.studentId} (${payMethod})`,
          recordedBy: tuition.recordedBy ?? "Staf",
          tuitionId: tuition.id,
        };
        posted = true;
        start(async () => {
          await saveKasEntry(entry);
        });
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
