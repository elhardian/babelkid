import type { Role } from "@/lib/types";

export type StaffRoleKey = "owner" | "admin" | "teacher";

/** none = no menu · read = lihat saja · write = lihat + ubah */
export type AccessLevel = "none" | "read" | "write";

export type PermissionId =
  | "beranda"
  | "registration"
  | "parents"
  | "students"
  | "guru"
  | "classes"
  | "kegiatan"
  | "presence"
  | "absensi"
  | "reports"
  | "tuition"
  | "kas"
  | "finance"
  | "events"
  | "roles";

export interface DashboardPermission {
  id: PermissionId;
  href: string;
  label: string;
  group: string;
  /** Always on for owner/admin; never grantable to teacher */
  managerOnly?: boolean;
  /** Only read makes sense (e.g. beranda) */
  readOnly?: boolean;
}

export const DASHBOARD_PERMISSIONS: DashboardPermission[] = [
  {
    id: "beranda",
    href: "/dashboard",
    label: "Beranda",
    group: "Utama",
    readOnly: true,
  },
  {
    id: "registration",
    href: "/dashboard/registration",
    label: "Pendaftaran",
    group: "Utama",
  },
  {
    id: "parents",
    href: "/dashboard/parents",
    label: "Orang tua",
    group: "Utama",
  },
  { id: "students", href: "/dashboard/students", label: "Siswa", group: "Akademik" },
  { id: "guru", href: "/dashboard/guru", label: "Guru", group: "Akademik" },
  { id: "classes", href: "/dashboard/classes", label: "Kelas", group: "Akademik" },
  {
    id: "kegiatan",
    href: "/dashboard/kegiatan",
    label: "Kegiatan",
    group: "Akademik",
  },
  {
    id: "presence",
    href: "/dashboard/presence",
    label: "Tanggal",
    group: "Akademik",
  },
  {
    id: "absensi",
    href: "/dashboard/absensi",
    label: "Absensi",
    group: "Akademik",
  },
  {
    id: "reports",
    href: "/dashboard/reports",
    label: "Laporan",
    group: "Akademik",
  },
  { id: "tuition", href: "/dashboard/tuition", label: "SPP", group: "Keuangan" },
  { id: "kas", href: "/dashboard/kas", label: "Kas", group: "Keuangan" },
  {
    id: "finance",
    href: "/dashboard/finance",
    label: "Keuangan",
    group: "Keuangan",
  },
  { id: "events", href: "/dashboard/events", label: "Acara", group: "Keuangan" },
  {
    id: "roles",
    href: "/dashboard/roles",
    label: "Peran & izin",
    group: "Sistem",
    managerOnly: true,
  },
];

export type RoleAccessMap = Record<PermissionId, AccessLevel>;
export type RolePermissionMap = Record<StaffRoleKey, RoleAccessMap>;

const ALL_IDS = DASHBOARD_PERMISSIONS.map((p) => p.id);

function fullWriteMap(): RoleAccessMap {
  return Object.fromEntries(
    ALL_IDS.map((id) => {
      const perm = DASHBOARD_PERMISSIONS.find((p) => p.id === id)!;
      return [id, perm.readOnly ? "read" : "write"];
    }),
  ) as RoleAccessMap;
}

function accessMapFromIds(
  ids: PermissionId[],
  level: AccessLevel = "write",
): RoleAccessMap {
  const set = new Set(ids);
  return Object.fromEntries(
    ALL_IDS.map((id) => {
      if (!set.has(id)) return [id, "none"];
      const perm = DASHBOARD_PERMISSIONS.find((p) => p.id === id)!;
      if (perm.readOnly) return [id, "read"];
      return [id, level];
    }),
  ) as RoleAccessMap;
}

const TEACHER_DEFAULT_IDS: PermissionId[] = [
  "beranda",
  "students",
  "classes",
  "kegiatan",
  "presence",
  "absensi",
  "reports",
];

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionMap = {
  owner: fullWriteMap(),
  admin: fullWriteMap(),
  teacher: accessMapFromIds(TEACHER_DEFAULT_IDS, "write"),
};

export const ACCESS_LEVEL_LABEL: Record<AccessLevel, string> = {
  none: "Tidak",
  read: "Baca",
  write: "Tulis",
};

export const STAFF_ROLE_META: Record<
  StaffRoleKey,
  { label: string; description: string }
> = {
  owner: {
    label: "Pemilik",
    description: "Akses penuh · tidak dapat dibatasi",
  },
  admin: {
    label: "Admin",
    description: "Kelola operasional & akses staf",
  },
  teacher: {
    label: "Guru",
    description: "Akses akademik & absensi",
  },
};

export function isStaffRoleKey(role: Role | string): role is StaffRoleKey {
  return role === "owner" || role === "admin" || role === "teacher";
}

export function permissionForPath(
  pathname: string,
): DashboardPermission | undefined {
  return DASHBOARD_PERMISSIONS.filter((p) =>
    p.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === p.href || pathname.startsWith(`${p.href}/`),
  ).sort((a, b) => b.href.length - a.href.length)[0];
}

export function getAccessLevel(
  matrix: RolePermissionMap,
  role: Role | string,
  permissionId: PermissionId,
): AccessLevel {
  if (role === "owner") {
    const perm = DASHBOARD_PERMISSIONS.find((p) => p.id === permissionId);
    return perm?.readOnly ? "read" : "write";
  }
  if (!isStaffRoleKey(role)) return "none";
  return matrix[role][permissionId] ?? "none";
}

export function canReadAccess(level: AccessLevel) {
  return level === "read" || level === "write";
}

export function canWriteAccess(level: AccessLevel) {
  return level === "write";
}

/** Accept v1 (string[]) or v2 (AccessLevel map) shapes */
export function normalizeRolePermissions(input?: unknown): RolePermissionMap {
  const raw = (input ?? {}) as Partial<
    Record<StaffRoleKey, RoleAccessMap | PermissionId[]>
  >;

  const next: RolePermissionMap = {
    owner: fullWriteMap(),
    admin: coerceRoleAccess(raw.admin, DEFAULT_ROLE_PERMISSIONS.admin),
    teacher: coerceRoleAccess(raw.teacher, DEFAULT_ROLE_PERMISSIONS.teacher),
  };

  // Hard rules
  next.owner = fullWriteMap();
  next.admin.beranda = "read";
  next.teacher.beranda = "read";
  next.admin.roles = "write";
  next.teacher.roles = "none";

  for (const p of DASHBOARD_PERMISSIONS) {
    if (p.managerOnly) {
      next.teacher[p.id] = "none";
      if (next.admin[p.id] === "none") next.admin[p.id] = "write";
    }
    if (p.readOnly) {
      if (next.admin[p.id] === "write") next.admin[p.id] = "read";
      if (next.teacher[p.id] === "write") next.teacher[p.id] = "read";
    }
  }

  return next;
}

function coerceRoleAccess(
  value: RoleAccessMap | PermissionId[] | undefined,
  fallback: RoleAccessMap,
): RoleAccessMap {
  if (!value) return { ...fallback };
  if (Array.isArray(value)) {
    return accessMapFromIds(value as PermissionId[], "write");
  }
  const out = { ...fallback };
  for (const id of ALL_IDS) {
    const level = value[id];
    if (level === "none" || level === "read" || level === "write") {
      out[id] = level;
    }
  }
  return out;
}

export function roleHasPermission(
  matrix: RolePermissionMap,
  role: Role | string,
  permissionId: PermissionId,
): boolean {
  return canReadAccess(getAccessLevel(matrix, role, permissionId));
}

export function roleCanWrite(
  matrix: RolePermissionMap,
  role: Role | string,
  permissionId: PermissionId,
): boolean {
  return canWriteAccess(getAccessLevel(matrix, role, permissionId));
}

export function canAccessPathWithMatrix(
  matrix: RolePermissionMap,
  role: Role | string,
  pathname: string,
): boolean {
  if (role === "owner") return true;
  if (!isStaffRoleKey(role)) return false;

  const perm = permissionForPath(pathname);
  if (!perm) return role === "admin";
  if (perm.managerOnly && role === "teacher") return false;
  return canReadAccess(matrix[role][perm.id] ?? "none");
}

export function filterNavWithMatrix<T extends { href: string }>(
  items: T[],
  matrix: RolePermissionMap,
  role: Role | string,
): T[] {
  return items.filter((item) =>
    canAccessPathWithMatrix(matrix, role, item.href),
  );
}
