"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";
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

  return (
    <div className="rounded-[2rem] border border-white/60 bg-white/95 p-6 shadow-[0_20px_50px_rgba(31,58,86,0.12)] backdrop-blur-sm sm:p-8">
      <form action={action} className="space-y-4" autoComplete="off">
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
            autoComplete="off"
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
            autoComplete="new-password"
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
    </div>
  );
}
