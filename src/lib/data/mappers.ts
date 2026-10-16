import { toDateOnly } from "@/lib/dates";
import type {
  ClassActivity,
  ClassPlacement,
  KasEntry,
  ParentProfile,
  PresenceRecord,
  RegistrationApplication,
  SchoolClass,
  SchoolDayOff,
  SchoolEvent,
  Student,
  StudentDocument,
  StudentReport,
  Teacher,
  TuitionRecord,
} from "@/lib/types";
import type { AccessLevel, PermissionId, RolePermissionMap } from "@/lib/role-permissions";
import {
  DEFAULT_ROLE_PERMISSIONS,
  DASHBOARD_PERMISSIONS,
  normalizeRolePermissions,
} from "@/lib/role-permissions";

type Json = unknown;

export function mapTeacher(row: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  jabatan: string | null;
  notes: string | null;
  createdAt: Date;
}): Teacher {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    role: row.role as Teacher["role"],
    jabatan: row.jabatan ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: toDateOnly(row.createdAt),
  };
}

export function mapClass(row: {
  id: string;
  name: string;
  level: string;
  teacherId: string;
  capacity: number;
  room: string;
  schedule: string;
  ageMinYears: number;
  ageMaxYears: number;
}): SchoolClass {
  return {
    id: row.id,
    name: row.name,
    level: row.level as SchoolClass["level"],
    teacherId: row.teacherId,
    capacity: row.capacity,
    room: row.room,
    schedule: row.schedule,
    ageMinYears: row.ageMinYears,
    ageMaxYears: row.ageMaxYears,
  };
}

export function mapParent(row: {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address: string | null;
  occupation: string | null;
  notes: string | null;
  createdAt: Date;
}): ParentProfile {
  return {
    id: row.id,
    name: row.name,
    relationship: row.relationship as ParentProfile["relationship"],
    phone: row.phone,
    email: row.email,
    address: row.address ?? undefined,
    occupation: row.occupation ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: toDateOnly(row.createdAt),
  };
}

export function mapPlacement(row: {
  id: string;
  classId: string;
  className: string;
  level: string;
  teacherName: string;
  startDate: Date;
  endDate: Date | null;
  note: string | null;
}): ClassPlacement {
  return {
    id: row.id,
    classId: row.classId,
    className: row.className,
    level: row.level as ClassPlacement["level"],
    teacherName: row.teacherName,
    startDate: toDateOnly(row.startDate),
    endDate: row.endDate ? toDateOnly(row.endDate) : undefined,
    note: row.note ?? undefined,
  };
}

export function mapDocument(row: {
  id: string;
  title: string;
  fileName: string;
  uploadedAt: Date;
  kind: string;
}): StudentDocument {
  return {
    id: row.id,
    title: row.title,
    fileName: row.fileName,
    uploadedAt: row.uploadedAt.toISOString(),
    kind: "generic",
  };
}

export function mapStudent(row: {
  id: string;
  name: string;
  nickname: string;
  dateOfBirth: Date;
  placeOfBirth: string | null;
  religion: string | null;
  gender: string;
  classId: string;
  status: string;
  enrollmentDate: Date;
  photoColor: string;
  allergies: string | null;
  additionalContact: string | null;
  notes: string | null;
  parents?: {
    relationship: string;
    parent: {
      id: string;
      name: string;
      phone: string;
      email: string;
      relationship: string;
    };
  }[];
  placements?: Parameters<typeof mapPlacement>[0][];
  documents?: Parameters<typeof mapDocument>[0][];
}): Student {
  return {
    id: row.id,
    name: row.name,
    nickname: row.nickname,
    dateOfBirth: toDateOnly(row.dateOfBirth),
    placeOfBirth: row.placeOfBirth ?? undefined,
    religion: row.religion ?? undefined,
    gender: row.gender as Student["gender"],
    classId: row.classId,
    status: row.status as Student["status"],
    enrollmentDate: toDateOnly(row.enrollmentDate),
    photoColor: row.photoColor,
    allergies: row.allergies ?? undefined,
    additionalContact: row.additionalContact ?? undefined,
    notes: row.notes ?? undefined,
    parents: (row.parents ?? []).map((sp) => ({
      id: sp.parent.id,
      name: sp.parent.name,
      relationship: sp.relationship as Student["parents"][0]["relationship"],
      phone: sp.parent.phone,
      email: sp.parent.email,
    })),
    classHistory: (row.placements ?? []).map(mapPlacement),
    documents: (row.documents ?? []).map(mapDocument),
  };
}

export function mapDayOff(row: {
  id: string;
  date: Date;
  title: string;
  description: string | null;
  type: string;
}): SchoolDayOff {
  return {
    id: row.id,
    date: toDateOnly(row.date),
    title: row.title,
    description: row.description ?? undefined,
    type: row.type as SchoolDayOff["type"],
  };
}

export function mapPresence(row: {
  id: string;
  studentId: string;
  classId: string;
  date: Date;
  status: string;
  note: string | null;
  recordedBy: string;
}): PresenceRecord {
  return {
    id: row.id,
    studentId: row.studentId,
    classId: row.classId,
    date: toDateOnly(row.date),
    status: row.status as PresenceRecord["status"],
    note: row.note ?? undefined,
    recordedBy: row.recordedBy,
  };
}

export function mapActivity(row: {
  id: string;
  classId: string;
  title: string;
  description: string;
  date: Date;
  teacherId: string | null;
  teacherName: string;
  images: Json;
  videoUrl: string | null;
  location: string | null;
}): ClassActivity {
  return {
    id: row.id,
    classId: row.classId,
    title: row.title,
    description: row.description,
    date: toDateOnly(row.date),
    teacherId: row.teacherId ?? undefined,
    teacherName: row.teacherName,
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    videoUrl: row.videoUrl ?? undefined,
    location: row.location ?? undefined,
  };
}

export function mapReport(row: {
  id: string;
  studentId: string;
  teacherId: string;
  date: Date;
  title: string;
  mood: string;
  activities: string;
  notes: string;
  skills: Json;
}): StudentReport {
  return {
    id: row.id,
    studentId: row.studentId,
    teacherId: row.teacherId,
    date: toDateOnly(row.date),
    title: row.title,
    mood: row.mood as StudentReport["mood"],
    activities: row.activities,
    notes: row.notes,
    skills: Array.isArray(row.skills) ? (row.skills as string[]) : [],
  };
}

export function mapTuition(row: {
  id: string;
  studentId: string;
  month: string;
  amount: number;
  status: string;
  dueDate: Date;
  paidAt: Date | null;
  paymentMethod: string | null;
  proofUrl: string | null;
  proofStatus: string | null;
  note: string | null;
  recordedBy: string | null;
}): TuitionRecord {
  return {
    id: row.id,
    studentId: row.studentId,
    month: row.month,
    amount: row.amount,
    status: row.status as TuitionRecord["status"],
    dueDate: toDateOnly(row.dueDate),
    paidAt: row.paidAt ? row.paidAt.toISOString() : undefined,
    paymentMethod: (row.paymentMethod as TuitionRecord["paymentMethod"]) ?? undefined,
    proofUrl: row.proofUrl ?? undefined,
    proofStatus: (row.proofStatus as TuitionRecord["proofStatus"]) ?? undefined,
    note: row.note ?? undefined,
    recordedBy: row.recordedBy ?? undefined,
  };
}

export function mapKas(row: {
  id: string;
  date: Date;
  type: string;
  account: string;
  source: string;
  amount: number;
  note: string;
  recordedBy: string;
  tuitionId: string | null;
}): KasEntry {
  return {
    id: row.id,
    date: toDateOnly(row.date),
    type: row.type as KasEntry["type"],
    account: row.account as KasEntry["account"],
    source: row.source as KasEntry["source"],
    amount: row.amount,
    note: row.note,
    recordedBy: row.recordedBy,
    tuitionId: row.tuitionId ?? undefined,
  };
}

export function mapEvent(row: {
  id: string;
  title: string;
  description: string;
  date: Date;
  endDate: Date | null;
  location: string;
  feePerChild: number;
  status: string;
  coverGradient: string;
  coverImage: string;
  documentation?: {
    id: string;
    caption: string;
    type: string;
    color: string;
    imageUrl: string | null;
    createdAt: Date;
  }[];
  attendees?: { studentId: string }[];
}): SchoolEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: toDateOnly(row.date),
    endDate: row.endDate ? toDateOnly(row.endDate) : undefined,
    location: row.location,
    feePerChild: row.feePerChild,
    status: row.status as SchoolEvent["status"],
    coverGradient: row.coverGradient,
    coverImage: row.coverImage,
    documentation: (row.documentation ?? []).map((d) => ({
      id: d.id,
      caption: d.caption,
      type: d.type as SchoolEvent["documentation"][0]["type"],
      color: d.color,
      imageUrl: d.imageUrl ?? undefined,
      createdAt: toDateOnly(d.createdAt),
    })),
    attendees: (row.attendees ?? []).map((a) => a.studentId),
  };
}

export function mapRegistration(row: {
  id: string;
  status: string;
  submittedAt: Date;
  notes: string | null;
  parentId: string | null;
  parentIds: Json;
  parent: Json;
  parents: Json;
  child: Json;
  formToken: string | null;
  formSentAt: Date | null;
  detailedForm: Json;
  detailedFormSubmittedAt: Date | null;
  registrationFee: Json;
  enrolledStudentId: string | null;
  enrolledAt: Date | null;
}): RegistrationApplication {
  return {
    id: row.id,
    status: row.status as RegistrationApplication["status"],
    submittedAt: row.submittedAt.toISOString(),
    notes: row.notes ?? undefined,
    parentId: row.parentId ?? undefined,
    parentIds: Array.isArray(row.parentIds)
      ? (row.parentIds as string[])
      : undefined,
    parent: row.parent as RegistrationApplication["parent"],
    parents: Array.isArray(row.parents)
      ? (row.parents as RegistrationApplication["parents"])
      : undefined,
    child: row.child as RegistrationApplication["child"],
    formToken: row.formToken ?? undefined,
    formSentAt: row.formSentAt?.toISOString(),
    detailedForm:
      (row.detailedForm as RegistrationApplication["detailedForm"]) ?? undefined,
    detailedFormSubmittedAt: row.detailedFormSubmittedAt?.toISOString(),
    registrationFee:
      (row.registrationFee as RegistrationApplication["registrationFee"]) ??
      undefined,
    enrolledStudentId: row.enrolledStudentId ?? undefined,
    enrolledAt: row.enrolledAt?.toISOString(),
  };
}

export function matrixFromRows(
  rows: { role: string; permissionId: string; accessLevel: string }[],
): RolePermissionMap {
  const base = structuredClone(DEFAULT_ROLE_PERMISSIONS);
  for (const row of rows) {
    const role = row.role as keyof RolePermissionMap;
    const id = row.permissionId as PermissionId;
    if (!base[role]) continue;
    if (!DASHBOARD_PERMISSIONS.some((p) => p.id === id)) continue;
    base[role][id] = row.accessLevel as AccessLevel;
  }
  return normalizeRolePermissions(base);
}

export function rowsFromMatrix(matrix: RolePermissionMap) {
  const roles = ["owner", "admin", "teacher"] as const;
  const out: {
    role: (typeof roles)[number];
    permissionId: PermissionId;
    accessLevel: AccessLevel;
  }[] = [];
  for (const role of roles) {
    for (const perm of DASHBOARD_PERMISSIONS) {
      out.push({
        role,
        permissionId: perm.id,
        accessLevel: matrix[role][perm.id] ?? "none",
      });
    }
  }
  return out;
}
