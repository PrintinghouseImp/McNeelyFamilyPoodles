"use client";

import { useActionState } from "react";
import {
  adminLogin,
  type AdminLoginState,
} from "@/app/admin/actions/auth";
import { btnPrimary, inputClass } from "@/components/admin/field";

const initial: AdminLoginState = {};

export function AdminLoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, action, pending] = useActionState(adminLogin, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div>
        <label
          htmlFor="username"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className={inputClass}
          placeholder="admin"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>
      {state.error ? (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className={btnPrimary} disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
