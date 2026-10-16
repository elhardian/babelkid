"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  assignableStaffRoles,
  canManageGuruAccess,
  canManageStaffRoles,
  type StaffAssignableRole,
} from "@/lib/staff-access";
import type { Role } from "@/lib/types";

export type StaffAccessResult =
  | {
      ok: true;
      created: boolean;
      email: string;
      name: string;
      password: string;
      role: Role;
    }
  | { ok: false; error: string };

function generateTempPassword() {
  const chunk = Math.random().toString(36).slice(2, 8);
  return `bk${chunk}`;
}

export async function getStaffAppAccess(email: string) {
  const session = await getSession("staff");
  if (!session || session.portal !== "staff") {
    return { exists: false as const };
  }
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { exists: false as const };

  const user = await prisma.user.findFirst({
    where: { email: normalized, portal: "staff" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
    },
  });
  if (!user) return { exists: false as const };

  return {
    exists: true as const,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    active: user.active,
  };
}

export async function createStaffAppAccess(input: {
  email: string;
  name: string;
  phone?: string;
  role: StaffAssignableRole;
  password?: string;
}): Promise<StaffAccessResult> {
  const session = await getSession("staff");
  if (!session || session.portal !== "staff") {
    return { ok: false, error: "Hanya staf yang dapat membuat akses." };
  }
  if (!canManageGuruAccess(session.role)) {
    return {
      ok: false,
      error: "Hanya admin / kepala sekolah yang dapat membuat akses guru.",
    };
  }

  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const role = input.role;
  const allowed = assignableStaffRoles(session.role);

  if (!email || !name) {
    return { ok: false, error: "Nama dan email wajib diisi." };
  }
  if (!allowed.includes(role)) {
    return {
      ok: false,
      error: "Anda tidak dapat menetapkan peran tersebut.",
    };
  }

  const password =
    input.password?.trim() && input.password.trim().length >= 6
      ? input.password.trim()
      : generateTempPassword();

  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.portal !== "staff") {
    return {
      ok: false,
      error: "Email ini sudah dipakai akun orang tua. Gunakan email lain.",
    };
  }

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        name,
        phone: input.phone?.trim() || existing.phone,
        passwordHash,
        role,
        portal: "staff",
        active: true,
      },
    });
    return {
      ok: true,
      created: false,
      email,
      name,
      password,
      role,
    };
  }

  await prisma.user.create({
    data: {
      email,
      name,
      phone: input.phone?.trim() || null,
      passwordHash,
      role,
      portal: "staff",
      active: true,
    },
  });

  return {
    ok: true,
    created: true,
    email,
    name,
    password,
    role,
  };
}

/** Sync roster role/name/phone to an existing staff login (no password change). */
export async function updateStaffRole(input: {
  email: string;
  name?: string;
  phone?: string;
  role: StaffAssignableRole;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSession("staff");
  if (!session || session.portal !== "staff") {
    return { ok: false, error: "Hanya staf yang dapat mengubah peran." };
  }
  if (!canManageStaffRoles(session.role)) {
    return {
      ok: false,
      error: "Hanya admin / kepala sekolah yang dapat mengubah peran.",
    };
  }

  const email = input.email.trim().toLowerCase();
  const role = input.role;
  const allowed = assignableStaffRoles(session.role);

  if (!email) return { ok: false, error: "Email wajib diisi." };
  if (!allowed.includes(role)) {
    return {
      ok: false,
      error: "Anda tidak dapat menetapkan peran tersebut.",
    };
  }

  const existing = await prisma.user.findFirst({
    where: { email, portal: "staff" },
  });
  if (!existing) {
    return { ok: true };
  }

  await prisma.user.update({
    where: { email },
    data: {
      role,
      ...(input.name?.trim() ? { name: input.name.trim() } : {}),
      ...(input.phone !== undefined
        ? { phone: input.phone.trim() || null }
        : {}),
    },
  });

  return { ok: true };
}
