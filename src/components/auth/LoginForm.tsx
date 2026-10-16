"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { DEMO_CREDENTIALS } from "@/lib/auth-demo";
import type { AuthPortal } from "@/lib/session-token";

const initialState: LoginState = {};

export function LoginForm({
  portal,
  next,
}: {
  portal: AuthPortal;
  next?: string;
}) {
  const [state, action, pending] = useActionState(loginAction, initialState);
  const demo =
    portal === "parent" ? DEMO_CREDENTIALS.parent : DEMO_CREDENTIALS.staff;

  function fillDemo() {
    const email = document.getElementById("login-email") as HTMLInputElement | null;
    const password = document.getElementById(
      "login-password",
    ) as HTMLInputElement | null;
    if (email) email.value = demo.email;
    if (password) password.value = demo.password;
  }

  return (
    <div className="rounded-[2rem] border border-white/60 bg-white/95 p-6 shadow-[0_20px_50px_rgba(31,58,86,0.12)] backdrop-blur-sm sm:p-8">
      <form action={action} className="space-y-4">
        <input type="hidden" name="portal" value={portal} />
        {next ? <input type="hidden" name="next" value={next} /> : null}

        <div>
          <label
            htmlFor="login-email"
            className="mb-1.5 block text-xs font-medium text-[#5B6B7C]"
          >
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            defaultValue={demo.email}
            className="w-full rounded-2xl border border-[#E5ECF5] bg-white px-4 py-3 text-sm text-[#1A2330] outline-none ring-[#3DB5E6]/30 focus:ring-2"
            placeholder="nama@email.com"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="mb-1.5 block text-xs font-medium text-[#5B6B7C]"
          >
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            defaultValue={demo.password}
            className="w-full rounded-2xl border border-[#E5ECF5] bg-white px-4 py-3 text-sm text-[#1A2330] outline-none ring-[#3DB5E6]/30 focus:ring-2"
            placeholder="••••••••"
          />
        </div>

        {state.error ? (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-2xl bg-[#3DB5E6] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2ea3d4] disabled:opacity-60"
        >
          {pending ? "Masuk…" : "Masuk"}
        </button>
      </form>

      <div className="mt-5 rounded-2xl bg-[#F3F7FC] p-4 text-xs leading-relaxed text-[#5B6B7C]">
        <p className="font-semibold text-[#1F3A56]">Akun demo</p>
        <p className="mt-1">{demo.label}</p>
        <p className="mt-1 font-mono text-[11px] text-[#1A2330]">
          {demo.email} · {demo.password}
        </p>
        <button
          type="button"
          onClick={fillDemo}
          className="mt-2 font-medium text-[#3DB5E6] hover:underline"
        >
          Isi otomatis
        </button>
      </div>
    </div>
  );
}
