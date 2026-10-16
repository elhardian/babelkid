import { createHmac, timingSafeEqual } from "crypto";
import type { Role } from "@/lib/types";

export const SESSION_COOKIE = "bk_session";

const AUTH_SECRET =
  process.env.AUTH_SECRET ?? "babelkids-demo-secret-change-me";

export type AuthPortal = "staff" | "parent";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
  portal: AuthPortal;
  childIds: string[];
  exp: number;
}

function sign(value: string) {
  return createHmac("sha256", AUTH_SECRET).update(value).digest("base64url");
}

export function encodeSession(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  return `${body}.${sign(body)}`;
}

export function decodeSession(token: string): SessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (!payload?.exp || payload.exp < Date.now()) return null;
    if (!payload.email || !payload.portal) return null;
    return payload;
  } catch {
    return null;
  }
}

export function readSessionFromToken(token: string | undefined) {
  if (!token) return null;
  return decodeSession(token);
}
