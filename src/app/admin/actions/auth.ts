"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";

export type AdminLoginState = {
  error?: string;
};

export async function adminLogin(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/admin");

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  try {
    await signIn("admin-credentials", {
      username,
      password,
      redirectTo: callbackUrl.startsWith("/admin") ? callbackUrl : "/admin",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid username or password." };
    }
    // Next.js redirect() throws; rethrow so navigation works
    throw error;
  }
}

export async function adminLogout() {
  await signOut({ redirectTo: "/admin/login" });
}
