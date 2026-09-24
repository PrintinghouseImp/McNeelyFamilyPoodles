"use server";

import { signIn, signOut } from "@/lib/auth";
import { safePortalCallback } from "@/lib/portal";

export async function signInWithGoogle(formData: FormData) {
  const dest = safePortalCallback(String(formData.get("callbackUrl") ?? ""));
  await signIn("google", { redirectTo: dest });
}

export async function signInWithFacebook(formData: FormData) {
  const dest = safePortalCallback(String(formData.get("callbackUrl") ?? ""));
  await signIn("facebook", { redirectTo: dest });
}

export async function portalLogout() {
  await signOut({ redirectTo: "/portal/login" });
}
