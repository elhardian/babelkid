import type { Role } from "@/lib/types";
import {
  DEFAULT_ROLE_PERMISSIONS,
  canAccessPathWithMatrix,
} from "@/lib/role-permissions";

export type StaffAssignableRole = "teacher" | "admin" | "owner";

export function isStaffManager(role: Role | string) {
  return role === "owner" || role === "admin";
}

/** Owner and admin can manage guru/parent akses and staff roles */
export function canManageGuruAccess(role: Role | string) {
  return isStaffManager(role);
}

export function canManageParentAccess(role: Role | string) {
  return isStaffManager(role);
}

export function canManageStaffRoles(role: Role | string) {
  return isStaffManager(role);
}

/** Roles an owner/admin may assign when managing staff */
export function assignableStaffRoles(
  _actorRole: Role | string,
): StaffAssignableRole[] {
  if (!canManageStaffRoles(_actorRole)) return [];
  return ["teacher", "admin", "owner"];
}

/** Fallback path check using default matrix (SSR / before provider hydrate) */
export function canAccessDashboardPath(role: Role | string, pathname: string) {
  return canAccessPathWithMatrix(DEFAULT_ROLE_PERMISSIONS, role, pathname);
}

export function filterNavByRole<T extends { href: string }>(
  items: T[],
  role: Role | string,
): T[] {
  return items.filter((item) => canAccessDashboardPath(role, item.href));
}
