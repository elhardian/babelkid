"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { getStudent } from "@/lib/mock-data";
import type { Student } from "@/lib/types";

interface ParentKidsContextValue {
  parentName: string;
  parentEmail: string;
  children: Student[];
  selectedChildId: string;
  selectedChild: Student;
  setSelectedChildId: (id: string) => void;
  /** All kids' ids for family-wide queries */
  childIds: string[];
}

const ParentKidsContext = createContext<ParentKidsContextValue | null>(null);

export function ParentKidsProvider({
  children,
  parentName,
  parentEmail,
  childIds,
}: {
  children: React.ReactNode;
  parentName: string;
  parentEmail: string;
  childIds: string[];
}) {
  const kids = useMemo(
    () =>
      childIds
        .map((id) => getStudent(id))
        .filter((s): s is Student => Boolean(s)),
    [childIds],
  );

  const [selectedChildId, setSelectedChildIdState] = useState(
    kids[0]?.id ?? childIds[0] ?? "",
  );

  const setSelectedChildId = useCallback(
    (id: string) => {
      if (childIds.includes(id)) {
        setSelectedChildIdState(id);
      }
    },
    [childIds],
  );

  const selectedChild =
    kids.find((k) => k.id === selectedChildId) ?? kids[0];

  if (!selectedChild) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F7FC] px-5 text-center">
        <div>
          <p className="text-lg font-medium text-[#1A2330]">
            Belum ada anak terhubung
          </p>
          <p className="mt-2 text-sm text-[#8A96A8]">
            Akun {parentEmail} belum memiliki siswa aktif. Hubungi admin sekolah.
          </p>
        </div>
      </div>
    );
  }

  const value: ParentKidsContextValue = {
    parentName,
    parentEmail,
    children: kids,
    selectedChildId: selectedChild.id,
    selectedChild,
    setSelectedChildId,
    childIds: kids.map((k) => k.id),
  };

  return (
    <ParentKidsContext.Provider value={value}>
      {children}
    </ParentKidsContext.Provider>
  );
}

export function useParentKids() {
  const ctx = useContext(ParentKidsContext);
  if (!ctx) {
    throw new Error("useParentKids must be used within ParentKidsProvider");
  }
  return ctx;
}
