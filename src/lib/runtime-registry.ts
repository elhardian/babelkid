import type {
  ClassActivity,
  KasEntry,
  ParentProfile,
  PresenceRecord,
  SchoolClass,
  SchoolDayOff,
  SchoolEvent,
  Student,
  StudentReport,
  Teacher,
  TuitionRecord,
} from "@/lib/types";

/** In-memory mirrors of MySQL rows for sync helpers (populated by providers). */
export const registry = {
  teachers: [] as Teacher[],
  classes: [] as SchoolClass[],
  students: [] as Student[],
  parents: [] as ParentProfile[],
  dayOffs: [] as SchoolDayOff[],
  presence: [] as PresenceRecord[],
  activities: [] as ClassActivity[],
  reports: [] as StudentReport[],
  tuition: [] as TuitionRecord[],
  kas: [] as KasEntry[],
  events: [] as SchoolEvent[],
};

export function getStudent(id: string) {
  return registry.students.find((s) => s.id === id);
}

export function getStudentsByParentEmail(email: string) {
  const q = email.trim().toLowerCase();
  return registry.students.filter((s) =>
    s.parents.some((p) => p.email.toLowerCase() === q),
  );
}

export function getClass(id: string) {
  return registry.classes.find((c) => c.id === id);
}

export function getTeacher(id: string) {
  return registry.teachers.find((t) => t.id === id);
}

export function getEvent(id: string) {
  return registry.events.find((e) => e.id === id);
}

export function studentsInClass(classId: string) {
  return registry.students.filter(
    (s) => s.classId === classId && s.status === "active",
  );
}

export function getDayOff(date: string, offs: SchoolDayOff[] = registry.dayOffs) {
  return offs.find((o) => o.date === date);
}

export function isWeekend(dateIso: string): boolean {
  const d = new Date(`${dateIso}T12:00:00`);
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function isSchoolClosed(
  dateIso: string,
  offs: SchoolDayOff[] = registry.dayOffs,
): boolean {
  return isWeekend(dateIso) || Boolean(getDayOff(dateIso, offs));
}

export function getKasBalance(
  account: KasEntry["account"],
  entries: KasEntry[] = registry.kas,
) {
  return entries
    .filter((e) => e.account === account)
    .reduce((sum, e) => sum + (e.type === "in" ? e.amount : -e.amount), 0);
}

export function getKasBalances(entries: KasEntry[] = registry.kas) {
  return {
    cash: getKasBalance("cash", entries),
    bank: getKasBalance("bank", entries),
    total: getKasBalance("cash", entries) + getKasBalance("bank", entries),
  };
}
