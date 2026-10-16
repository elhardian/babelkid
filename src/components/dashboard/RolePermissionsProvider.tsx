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
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/types";
import { useStaffSession } from "@/components/dashboard/StaffSessionProvider";
import {
  resetRolePermissionsAction,
  saveRoleAccessLevel,
} from "@/app/actions/school-data";
import {
  DEFAULT_ROLE_PERMISSIONS,
  canAccessPathWithMatrix,
  canReadAccess,
  canWriteAccess,
  filterNavWithMatrix,
  getAccessLevel,
  normalizeRolePermissions,
  permissionForPath,
  type AccessLevel,
  type PermissionId,
  type RolePermissionMap,
  type StaffRoleKey,
} from "@/lib/role-permissions";

interface RolePermissionsContextValue {
  matrix: RolePermissionMap;
  setAccessLevel: (
    role: StaffRoleKey,
    id: PermissionId,
    level: AccessLevel,
  ) => void;
  resetDefaults: () => void;
  canAccessPath: (role: Role | string, pathname: string) => boolean;
  getLevel: (role: Role | string, id: PermissionId) => AccessLevel;
  canRead: (role: Role | string, id: PermissionId) => boolean;
  canWrite: (role: Role | string, id: PermissionId) => boolean;
  filterNav: <T extends { href: string }>(
    items: T[],
    role: Role | string,
  ) => T[];
}

const RolePermissionsContext =
  createContext<RolePermissionsContextValue | null>(null);

export function RolePermissionsProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial?: RolePermissionMap;
}) {
  const [matrix, setMatrix] = useState<RolePermissionMap>(
    normalizeRolePermissions(initial ?? DEFAULT_ROLE_PERMISSIONS),
  );
  const [, start] = useTransition();

  useEffect(() => {
    if (initial) setMatrix(normalizeRolePermissions(initial));
  }, [initial]);

  const setAccessLevel = useCallback(
    (role: StaffRoleKey, id: PermissionId, level: AccessLevel) => {
      if (role === "owner") return;
      if (id === "beranda" && level === "none") return;
      setMatrix((prev) =>
        normalizeRolePermissions({
          ...prev,
          [role]: { ...prev[role], [id]: level },
        }),
      );
      start(async () => {
        const next = await saveRoleAccessLevel(role, id, level);
        setMatrix(next);
      });
    },
    [],
  );

  const resetDefaults = useCallback(() => {
    setMatrix(DEFAULT_ROLE_PERMISSIONS);
    start(async () => {
      const next = await resetRolePermissionsAction();
      setMatrix(next);
    });
  }, []);

  const canAccessPath = useCallback(
    (role: Role | string, pathname: string) =>
      canAccessPathWithMatrix(matrix, role, pathname),
    [matrix],
  );

  const getLevel = useCallback(
    (role: Role | string, id: PermissionId) =>
      getAccessLevel(matrix, role, id),
    [matrix],
  );

  const canRead = useCallback(
    (role: Role | string, id: PermissionId) =>
      canReadAccess(getAccessLevel(matrix, role, id)),
    [matrix],
  );

  const canWrite = useCallback(
    (role: Role | string, id: PermissionId) =>
      canWriteAccess(getAccessLevel(matrix, role, id)),
    [matrix],
  );

  const filterNav = useCallback(
    <T extends { href: string }>(items: T[], role: Role | string) =>
      filterNavWithMatrix(items, matrix, role),
    [matrix],
  );

  const value = useMemo(
    () => ({
      matrix,
      setAccessLevel,
      resetDefaults,
      canAccessPath,
      getLevel,
      canRead,
      canWrite,
      filterNav,
    }),
    [
      matrix,
      setAccessLevel,
      resetDefaults,
      canAccessPath,
      getLevel,
      canRead,
      canWrite,
      filterNav,
    ],
  );

  return (
    <RolePermissionsContext.Provider value={value}>
      {children}
    </RolePermissionsContext.Provider>
  );
}

export function useRolePermissions() {
  const ctx = useContext(RolePermissionsContext);
  if (!ctx) {
    throw new Error(
      "useRolePermissions must be used within RolePermissionsProvider",
    );
  }
  return ctx;
}

export function usePermissionAccess(permissionId: PermissionId) {
  const session = useStaffSession();
  const { getLevel, canRead, canWrite } = useRolePermissions();
  return {
    level: getLevel(session.role, permissionId),
    canRead: canRead(session.role, permissionId),
    canWrite: canWrite(session.role, permissionId),
  };
}

export function usePathPermissionAccess() {
  const session = useStaffSession();
  const pathname = usePathname();
  const { getLevel, canRead, canWrite } = useRolePermissions();
  const perm = permissionForPath(pathname);
  if (!perm) {
    return {
      permissionId: null as PermissionId | null,
      level: "none" as AccessLevel,
      canRead: false,
      canWrite: false,
    };
  }
  return {
    permissionId: perm.id,
    level: getLevel(session.role, perm.id),
    canRead: canRead(session.role, perm.id),
    canWrite: canWrite(session.role, perm.id),
  };
}
