"use client";

import { createContext, useContext } from "react";
import type { SessionPayload } from "@/lib/session-token";
import { roleLabel } from "@/lib/auth-labels";

const StaffSessionContext = createContext<SessionPayload | null>(null);

export function StaffSessionProvider({
  session,
  children,
}: {
  session: SessionPayload;
  children: React.ReactNode;
}) {
  return (
    <StaffSessionContext.Provider value={session}>
      {children}
    </StaffSessionContext.Provider>
  );
}

export function useStaffSession() {
  const ctx = useContext(StaffSessionContext);
  if (!ctx) {
    throw new Error("useStaffSession must be used within StaffSessionProvider");
  }
  return ctx;
}

export function useStaffSessionLabel() {
  const session = useStaffSession();
  return {
    name: session.name,
    role: roleLabel(session.role),
    roleKey: session.role,
    email: session.email,
  };
}
