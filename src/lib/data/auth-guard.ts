import { getSession } from "@/lib/auth";
import type { SessionPayload } from "@/lib/session-token";

export async function requireStaff(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || session.portal !== "staff") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireStaffOrParent(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}
