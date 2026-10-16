"use server";

import { requireStaff, requireStaffOrParent } from "@/lib/data/auth-guard";
import * as roster from "@/lib/data/roster";
import * as ops from "@/lib/data/ops";
import * as finance from "@/lib/data/finance";
import * as events from "@/lib/data/events";
import * as rolePerms from "@/lib/data/role-permissions";
import type {
  ClassActivity,
  KasEntry,
  ParentProfile,
  PresenceRecord,
  RegistrationApplication,
  SchoolClass,
  SchoolDayOff,
  SchoolEvent,
  Student,
  StudentReport,
  Teacher,
  TuitionRecord,
} from "@/lib/types";
import type {
  AccessLevel,
  PermissionId,
  RolePermissionMap,
  StaffRoleKey,
} from "@/lib/role-permissions";

export async function fetchTeachers() {
  await requireStaff();
  return roster.listTeachers();
}

export async function saveTeacher(
  input: Parameters<typeof roster.upsertTeacher>[0],
) {
  await requireStaff();
  return roster.upsertTeacher(input);
}

export async function deleteTeacher(id: string) {
  await requireStaff();
  await roster.removeTeacher(id);
}

export async function fetchClasses() {
  await requireStaffOrParent();
  return roster.listClasses();
}

/** Public class list for registration form (no auth). */
export async function fetchPublicClasses() {
  return roster.listClasses();
}

export async function saveClass(
  input: Parameters<typeof roster.upsertClass>[0],
) {
  await requireStaff();
  return roster.upsertClass(input);
}

export async function saveClassTeacher(classId: string, teacherId: string) {
  await requireStaff();
  return roster.assignClassTeacher(classId, teacherId);
}

export async function deleteClass(id: string) {
  await requireStaff();
  await roster.removeClass(id);
}

export async function fetchParents() {
  await requireStaff();
  return roster.listParents();
}

export async function saveParent(
  input: Parameters<typeof roster.upsertParent>[0],
) {
  await requireStaff();
  return roster.upsertParent(input);
}

export async function deleteParent(id: string) {
  await requireStaff();
  await roster.removeParent(id);
}

export async function fetchStudents() {
  await requireStaffOrParent();
  return roster.listStudents();
}

export async function fetchStudent(id: string) {
  await requireStaffOrParent();
  return roster.getStudentById(id);
}

export async function saveStudent(
  input: Parameters<typeof roster.upsertStudent>[0],
) {
  await requireStaff();
  return roster.upsertStudent(input);
}

export async function fetchDayOffs() {
  await requireStaffOrParent();
  return ops.listDayOffs();
}

export async function saveDayOff(
  input: Parameters<typeof ops.upsertDayOff>[0],
) {
  await requireStaff();
  return ops.upsertDayOff(input);
}

export async function deleteDayOff(id: string) {
  await requireStaff();
  await ops.removeDayOff(id);
}

export async function fetchPresence() {
  await requireStaffOrParent();
  return ops.listPresence();
}

export async function savePresenceBatch(
  rows: Parameters<typeof ops.upsertPresenceBatch>[0],
) {
  await requireStaff();
  return ops.upsertPresenceBatch(rows);
}

export async function fetchActivities() {
  await requireStaffOrParent();
  return ops.listActivities();
}

export async function saveActivity(
  input: Parameters<typeof ops.upsertActivity>[0],
) {
  await requireStaff();
  return ops.upsertActivity(input);
}

export async function deleteActivity(id: string) {
  await requireStaff();
  await ops.removeActivity(id);
}

export async function fetchReports() {
  await requireStaffOrParent();
  return ops.listReports();
}

export async function saveReport(
  input: Parameters<typeof ops.upsertReport>[0],
) {
  await requireStaff();
  return ops.upsertReport(input);
}

export async function deleteReport(id: string) {
  await requireStaff();
  await ops.removeReport(id);
}

export async function fetchTuition() {
  await requireStaffOrParent();
  return finance.listTuition();
}

export async function saveTuition(
  input: Parameters<typeof finance.upsertTuition>[0],
) {
  await requireStaffOrParent();
  return finance.upsertTuition(input);
}

export async function fetchKas() {
  await requireStaff();
  return finance.listKas();
}

export async function saveKasEntry(
  input: Parameters<typeof finance.addKasEntry>[0],
) {
  await requireStaff();
  return finance.addKasEntry(input);
}

export async function fetchFinanceSummaries() {
  await requireStaff();
  return finance.getFinanceSummaries();
}

export async function fetchEvents() {
  await requireStaffOrParent();
  return events.listEvents();
}

export async function fetchEvent(id: string) {
  await requireStaffOrParent();
  return events.getEventById(id);
}

export async function saveEvent(
  input: Parameters<typeof events.upsertEvent>[0],
) {
  await requireStaff();
  return events.upsertEvent(input);
}

export async function fetchRegistrations() {
  await requireStaff();
  return events.listRegistrations();
}

export async function fetchRegistration(id: string) {
  await requireStaff();
  return events.getRegistrationById(id);
}

export async function fetchRegistrationByToken(token: string) {
  return events.getRegistrationByToken(token);
}

export async function saveRegistration(input: RegistrationApplication) {
  return events.upsertRegistration(input);
}

export async function fetchRolePermissions(): Promise<RolePermissionMap> {
  await requireStaff();
  return rolePerms.getRolePermissionMatrix();
}

export async function saveRoleAccessLevel(
  role: StaffRoleKey,
  permissionId: PermissionId,
  accessLevel: AccessLevel,
) {
  await requireStaff();
  return rolePerms.setRoleAccessLevel(role, permissionId, accessLevel);
}

export async function resetRolePermissionsAction() {
  await requireStaff();
  return rolePerms.resetRolePermissions();
}

/** Bootstrap payload for dashboard layout */
export async function fetchDashboardBootstrap() {
  await requireStaff();
  const [
    teachers,
    classes,
    students,
    parents,
    dayOffs,
    activities,
    kas,
    rolePermissions,
  ] = await Promise.all([
    roster.listTeachers(),
    roster.listClasses(),
    roster.listStudents(),
    roster.listParents(),
    ops.listDayOffs(),
    ops.listActivities(),
    finance.listKas(),
    rolePerms.getRolePermissionMatrix(),
  ]);
  return {
    teachers,
    classes,
    students,
    parents,
    dayOffs,
    activities,
    kas,
    rolePermissions,
  };
}

export type DashboardBootstrap = Awaited<
  ReturnType<typeof fetchDashboardBootstrap>
>;

// Re-export types for consumers
export type {
  Teacher,
  SchoolClass,
  Student,
  ParentProfile,
  SchoolDayOff,
  PresenceRecord,
  ClassActivity,
  StudentReport,
  TuitionRecord,
  KasEntry,
  SchoolEvent,
  RegistrationApplication,
};
