"use server";

import { signOut } from "@/lib/auth";

/**
 * Sign out any Auth.js session (admin credentials or customer OAuth)
 * and return to the public home page.
 */
export async function siteSignOut() {
  await signOut({ redirectTo: "/" });
}
