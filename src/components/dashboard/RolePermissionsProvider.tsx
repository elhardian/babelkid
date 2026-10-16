"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/types";
import { useStaffSession } from "@/components/dashboard/StaffSessionProvider";
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

const STORAGE_KEY = "babelkids.role-permissions.v2";
const LEGACY_STORAGE_KEY = "babelkids.role-permissions.v1";

let store: RolePermissionMap = normalizeRolePermissions(
  DEFAULT_ROLE_PERMISSIONS,
);
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return store;
}

function setStore(next: RolePermissionMap) {
  store = normalizeRolePermissions(next);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
  emit();
}

function readFromStorage(): RolePermissionMap | null {
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    return normalizeRolePermissions(JSON.parse(raw));
  } catch {
    return null;
  }
}

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
}: {
  children: React.ReactNode;
}) {
  const matrix = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (hydrated) return;
    hydrated = true;
    const saved = readFromStorage();
    if (saved) {
      store = saved;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      emit();
    }
  }, []);

  const setAccessLevel = useCallback(
    (role: StaffRoleKey, id: PermissionId, level: AccessLevel) => {
      if (role === "owner") return;
      if (id === "beranda" && level === "none") return;
      setStore({
        ...store,
        [role]: { ...store[role], [id]: level },
      });
    },
    [],
  );

  const resetDefaults = useCallback(() => {
    setStore(DEFAULT_ROLE_PERMISSIONS);
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

/** Access level for the current staff session on a given permission. */
export function usePermissionAccess(permissionId: PermissionId) {
  const session = useStaffSession();
  const { getLevel, canRead, canWrite } = useRolePermissions();
  return {
    level: getLevel(session.role, permissionId),
    canRead: canRead(session.role, permissionId),
    canWrite: canWrite(session.role, permissionId),
  };
}

/** Access level for the current dashboard path. */
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
