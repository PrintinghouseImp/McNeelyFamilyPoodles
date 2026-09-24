import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Require an authenticated ADMIN session or redirect away. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/admin/login");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/portal");
  }
  return session;
}
