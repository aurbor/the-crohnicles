"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/auth/actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-muted">
          Secret gut password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          required
          placeholder="••••••••"
          className="input-field"
        />
      </div>

      {state.error && (
        <p className="text-sm font-medium text-brand-rose" role="alert">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Checking your credentials…" : "Let me in"}
      </button>
    </form>
  );
}
