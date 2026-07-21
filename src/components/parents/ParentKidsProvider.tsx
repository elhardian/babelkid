"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  currentParentChildIds,
  currentParentName,
  getStudent,
} from "@/lib/mock-data";
import type { Student } from "@/lib/types";

interface ParentKidsContextValue {
  parentName: string;
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
}: {
  children: React.ReactNode;
}) {
  const kids = useMemo(
    () =>
      currentParentChildIds
        .map((id) => getStudent(id))
        .filter((s): s is Student => Boolean(s)),
    [],
  );

  const [selectedChildId, setSelectedChildIdState] = useState(
    kids[0]?.id ?? currentParentChildIds[0],
  );

  const setSelectedChildId = useCallback((id: string) => {
    if (currentParentChildIds.includes(id)) {
      setSelectedChildIdState(id);
    }
  }, []);

  const selectedChild =
    kids.find((k) => k.id === selectedChildId) ?? kids[0]!;

  const value: ParentKidsContextValue = {
    parentName: currentParentName,
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
