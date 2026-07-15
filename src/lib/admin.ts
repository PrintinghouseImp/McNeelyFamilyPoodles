import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Require an authenticated ADMIN session or redirect to login. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }
  return session;
}
