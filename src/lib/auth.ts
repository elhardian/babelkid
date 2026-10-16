import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import type { Role } from "@/lib/types";
import { prisma } from "@/lib/db";
import { listStudents } from "@/lib/data/roster";
import {
  encodeSession,
  type AuthPortal,
  type SessionPayload,
  SESSION_COOKIE,
} from "@/lib/session-token";

export type { AuthPortal, SessionPayload };
export { SESSION_COOKIE, readSessionFromToken } from "@/lib/session-token";
export { roleLabel } from "@/lib/auth-labels";

const SESSION_DAYS = 7;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  portal: AuthPortal;
  childIds?: string[];
}

function parseChildIds(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string");
  }
  return [];
}

export async function findUserByCredentials(
  email: string,
  password: string,
  portal?: AuthPortal,
): Promise<AuthUser | null> {
  const normalized = email.trim().toLowerCase();
  const row = await prisma.user.findFirst({
    where: {
      email: normalized,
      active: true,
      ...(portal ? { portal } : {}),
    },
  });
  if (!row) return null;

  const ok = await bcrypt.compare(password, row.passwordHash);
  if (!ok) return null;

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as Role,
    portal: row.portal as AuthPortal,
    childIds: parseChildIds(row.childIds),
  };
}

export async function buildSession(user: AuthUser): Promise<SessionPayload> {
  let childIds = user.childIds ?? [];
  if (user.portal === "parent" && childIds.length === 0) {
    const students = await listStudents();
    const q = user.email.toLowerCase();
    childIds = students
      .filter((s) => s.parents.some((p) => p.email.toLowerCase() === q))
      .map((s) => s.id);
  }

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    portal: user.portal,
    childIds,
    exp: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  };
}

export async function createSession(user: AuthUser) {
  const payload = await buildSession(user);
  const token = encodeSession(payload);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(payload.exp),
  });
  return payload;
}

export async function destroySession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const { decodeSession } = await import("@/lib/session-token");
  return decodeSession(token);
}
