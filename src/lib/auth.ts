import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import type { Role } from "@/lib/types";
import { prisma } from "@/lib/db";
import { listStudents } from "@/lib/data/roster";
import {
  encodeSession,
  decodeSession,
  sessionCookieFor,
  type AuthPortal,
  type SessionPayload,
  SESSION_COOKIE_LEGACY,
  SESSION_COOKIE_STAFF,
  SESSION_COOKIE_PARENT,
} from "@/lib/session-token";

export type { AuthPortal, SessionPayload };
export {
  SESSION_COOKIE_LEGACY as SESSION_COOKIE,
  SESSION_COOKIE_STAFF,
  SESSION_COOKIE_PARENT,
  sessionCookieFor,
  readSessionFromToken,
} from "@/lib/session-token";
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

function cookieOptions(expires?: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(expires ? { expires } : {}),
  };
}

async function clearCookie(name: string) {
  const jar = await cookies();
  jar.set(name, "", {
    ...cookieOptions(new Date(0)),
    maxAge: 0,
  });
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
  jar.set(sessionCookieFor(user.portal), token, cookieOptions(new Date(payload.exp)));
  // Drop legacy shared cookie so it cannot override the other portal
  jar.set(SESSION_COOKIE_LEGACY, "", {
    ...cookieOptions(new Date(0)),
    maxAge: 0,
  });
  return payload;
}

export async function destroySession(portal?: AuthPortal) {
  if (portal) {
    await clearCookie(sessionCookieFor(portal));
  } else {
    await clearCookie(SESSION_COOKIE_STAFF);
    await clearCookie(SESSION_COOKIE_PARENT);
  }
  await clearCookie(SESSION_COOKIE_LEGACY);
}

/** Read session for a specific portal (staff dashboard vs parent app). */
export async function getSession(
  portal: AuthPortal,
): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(sessionCookieFor(portal))?.value;
  if (!token) return null;
  const session = decodeSession(token);
  if (!session || session.portal !== portal) return null;
  return session;
}

/** Prefer staff, then parent — for shared data actions. */
export async function getAnySession(): Promise<SessionPayload | null> {
  return (await getSession("staff")) ?? (await getSession("parent"));
}
