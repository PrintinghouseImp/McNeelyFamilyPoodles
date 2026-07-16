import Link from "next/link";
import { AdminLoginForm } from "@/components/admin/login-form";

/** Never prerender — Netlify OpenNext breaks prerendered auth pages. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Admin Login",
};

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

/**
 * Login UI only — no server-side auth() call.
 * Session redirect after sign-in is handled by Auth.js redirectTo + dashboard layout.
 */
export default async function AdminLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const callbackUrl =
    params.callbackUrl?.startsWith("/admin") &&
    !params.callbackUrl.startsWith("/admin/login")
      ? params.callbackUrl
      : "/admin";

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="mb-1 text-xs uppercase tracking-widest text-gray-400">
          Admin
        </p>
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-black">
          Breeder admin
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Sign in with your admin username and password to manage inventory,
          photos, medical records, and applications.
        </p>
        <AdminLoginForm callbackUrl={callbackUrl} />
        <p className="mt-8 text-xs text-gray-400">
          <Link href="/" className="hover:text-black">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
