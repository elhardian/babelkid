"use server";

import { redirect } from "next/navigation";
import {
  createSession,
  destroySession,
  findUserByCredentials,
  getSession,
  type AuthPortal,
} from "@/lib/auth";

export type LoginState = {
  error?: string;
  ok?: boolean;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const portal = (String(formData.get("portal") || "staff") ||
    "staff") as AuthPortal;
  const next = String(formData.get("next") || "").trim();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  if (portal !== "staff" && portal !== "parent") {
    return { error: "Portal tidak valid." };
  }

  const user = await findUserByCredentials(email, password, portal);
  if (!user) {
    return {
      error:
        portal === "parent"
          ? "Email atau password orang tua salah."
          : "Email atau password staf salah.",
    };
  }

  await createSession(user);

  if (portal === "parent") {
    redirect(next.startsWith("/parents") ? next : "/parents");
  }
  redirect(next.startsWith("/dashboard") ? next : "/dashboard");
}

export async function logoutAction() {
  const session = await getSession();
  const portal = session?.portal;
  await destroySession();
  redirect(portal === "parent" ? "/app" : "/login");
}

export async function logoutToHomeAction() {
  await destroySession();
  redirect("/");
}
