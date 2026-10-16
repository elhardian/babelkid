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
import { saveStudent } from "@/app/actions/school-data";
import { registry } from "@/lib/runtime-registry";
import type { Student } from "@/lib/types";

export type StudentInput = Omit<Student, "id"> & { id?: string };

interface StudentsContextValue {
  students: Student[];
  upsert: (input: StudentInput) => Student;
  getById: (id: string) => Student | undefined;
}

const StudentsContext = createContext<StudentsContextValue | null>(null);

function applyOptimistic(input: StudentInput): Student {
  return {
    id: input.id ?? `s-${Date.now()}`,
    name: input.name,
    nickname: input.nickname,
    dateOfBirth: input.dateOfBirth,
    placeOfBirth: input.placeOfBirth,
    religion: input.religion,
    gender: input.gender,
    classId: input.classId,
    status: input.status,
    enrollmentDate: input.enrollmentDate,
    parents: input.parents,
    photoColor: input.photoColor,
    allergies: input.allergies,
    additionalContact: input.additionalContact,
    notes: input.notes,
    classHistory: input.classHistory,
    documents: input.documents,
  };
}

export function StudentsProvider({
  children,
  initial = [],
}: {
  children: React.ReactNode;
  initial?: Student[];
}) {
  const [students, setStudents] = useState<Student[]>(initial);
  const [, start] = useTransition();

  useEffect(() => {
    setStudents(initial);
  }, [initial]);

  registry.students = students;

  const upsert = useCallback((input: StudentInput) => {
    const optimistic = applyOptimistic(input);
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === optimistic.id);
      return exists
        ? prev.map((s) => (s.id === optimistic.id ? optimistic : s))
        : [optimistic, ...prev];
    });
    start(async () => {
      const saved = await saveStudent(input);
      setStudents((prev) => {
        const rest = prev.filter(
          (s) => s.id !== optimistic.id && s.id !== saved.id,
        );
        return [saved, ...rest];
      });
    });
    return optimistic;
  }, []);

  const getById = useCallback(
    (id: string) => students.find((s) => s.id === id),
    [students],
  );

  const value = useMemo(
    () => ({ students, upsert, getById }),
    [students, upsert, getById],
  );

  return (
    <StudentsContext.Provider value={value}>{children}</StudentsContext.Provider>
  );
}

export function useStudentsRegistry() {
  const ctx = useContext(StudentsContext);
  if (!ctx) {
    throw new Error("useStudentsRegistry must be used within StudentsProvider");
  }
  return ctx;
}

export function enrollStudentFromRegistration(input: StudentInput) {
  // Called from registration flows — persist via action in those flows.
  // Optimistic local insert for immediate UI if provider already mounted.
  const student = applyOptimistic(input);
  registry.students = [
    student,
    ...registry.students.filter((s) => s.id !== student.id),
  ];
  void saveStudent(input).then((saved) => {
    registry.students = [
      saved,
      ...registry.students.filter((s) => s.id !== saved.id && s.id !== student.id),
    ];
  });
  return student;
}
