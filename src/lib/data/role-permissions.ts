import { prisma } from "@/lib/db";
import {
  DEFAULT_ROLE_PERMISSIONS,
  type AccessLevel,
  type PermissionId,
  type RolePermissionMap,
  type StaffRoleKey,
} from "@/lib/role-permissions";
import { matrixFromRows, rowsFromMatrix } from "@/lib/data/mappers";

export async function getRolePermissionMatrix(): Promise<RolePermissionMap> {
  const rows = await prisma.rolePermission.findMany();
  if (rows.length === 0) return DEFAULT_ROLE_PERMISSIONS;
  return matrixFromRows(rows);
}

export async function setRoleAccessLevel(
  role: StaffRoleKey,
  permissionId: PermissionId,
  accessLevel: AccessLevel,
) {
  await prisma.rolePermission.upsert({
    where: {
      role_permissionId: { role, permissionId },
    },
    create: { role, permissionId, accessLevel },
    update: { accessLevel },
  });
  return getRolePermissionMatrix();
}

export async function resetRolePermissions() {
  await prisma.rolePermission.deleteMany();
  const rows = rowsFromMatrix(DEFAULT_ROLE_PERMISSIONS);
  await prisma.rolePermission.createMany({ data: rows });
  return DEFAULT_ROLE_PERMISSIONS;
}

export async function saveRolePermissionMatrix(matrix: RolePermissionMap) {
  await prisma.rolePermission.deleteMany();
  await prisma.rolePermission.createMany({ data: rowsFromMatrix(matrix) });
  return getRolePermissionMatrix();
}
