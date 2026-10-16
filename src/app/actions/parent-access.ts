"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { canManageParentAccess } from "@/lib/staff-access";

export type ParentAccessResult =
  | {
      ok: true;
      created: boolean;
      email: string;
      name: string;
      password: string;
      childIds: string[];
      childCount: number;
    }
  | { ok: false; error: string };

function generateTempPassword() {
  const chunk = Math.random().toString(36).slice(2, 8);
  return `bk${chunk}`;
}

export async function getParentAppAccess(email: string) {
  const session = await getSession("staff");
  if (!session || session.portal !== "staff") {
    return { exists: false as const };
  }
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { exists: false as const };

  const user = await prisma.user.findFirst({
    where: { email: normalized, portal: "parent" },
    select: {
      id: true,
      email: true,
      name: true,
      active: true,
      childIds: true,
    },
  });
  if (!user) return { exists: false as const };

  const childIds = Array.isArray(user.childIds)
    ? user.childIds.filter((id): id is string => typeof id === "string")
    : [];

  return {
    exists: true as const,
    email: user.email,
    name: user.name,
    active: user.active,
    childIds,
  };
}

export async function createParentAppAccess(input: {
  email: string;
  name: string;
  phone?: string;
  childIds: string[];
  password?: string;
}): Promise<ParentAccessResult> {
  const session = await getSession("staff");
  if (!session || session.portal !== "staff") {
    return { ok: false, error: "Hanya staf yang dapat membuat akses app." };
  }
  if (!canManageParentAccess(session.role)) {
    return {
      ok: false,
      error: "Hanya admin / kepala sekolah yang dapat membuat akses orang tua.",
    };
  }

  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const childIds = [...new Set(input.childIds.filter(Boolean))];

  if (!email || !name) {
    return { ok: false, error: "Nama dan email wajib diisi." };
  }
  if (childIds.length === 0) {
    return {
      ok: false,
      error: "Hubungkan minimal satu anak ke orang tua ini dulu.",
    };
  }

  const password =
    input.password?.trim() && input.password.trim().length >= 6
      ? input.password.trim()
      : generateTempPassword();

  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.portal !== "parent") {
    return {
      ok: false,
      error: "Email ini sudah dipakai akun staf. Gunakan email lain.",
    };
  }

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        name,
        phone: input.phone?.trim() || existing.phone,
        passwordHash,
        childIds,
        role: "parent",
        portal: "parent",
        active: true,
      },
    });
    return {
      ok: true,
      created: false,
      email,
      name,
      password,
      childIds,
      childCount: childIds.length,
    };
  }

  await prisma.user.create({
    data: {
      email,
      name,
      phone: input.phone?.trim() || null,
      passwordHash,
      role: "parent",
      portal: "parent",
      childIds,
      active: true,
    },
  });

  return {
    ok: true,
    created: true,
    email,
    name,
    password,
    childIds,
    childCount: childIds.length,
  };
}
