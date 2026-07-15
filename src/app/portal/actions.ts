"use server";

import { signIn, signOut } from "@/lib/auth";

export async function signInWithGoogle(formData: FormData) {
  const callbackUrl = String(formData.get("callbackUrl") ?? "/portal");
  const dest =
    callbackUrl.startsWith("/portal") && !callbackUrl.startsWith("/portal/login")
      ? callbackUrl
      : "/portal";
  await signIn("google", { redirectTo: dest });
}

export async function signInWithFacebook(formData: FormData) {
  const callbackUrl = String(formData.get("callbackUrl") ?? "/portal");
  const dest =
    callbackUrl.startsWith("/portal") && !callbackUrl.startsWith("/portal/login")
      ? callbackUrl
      : "/portal";
  await signIn("facebook", { redirectTo: dest });
}

export async function portalLogout() {
  await signOut({ redirectTo: "/portal/login" });
}
