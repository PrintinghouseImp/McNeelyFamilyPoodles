import Link from "next/link";
import { adminLogout } from "@/app/admin/actions/auth";
import { requireAdmin } from "@/lib/admin";
import { ADMIN_NAV, SITE } from "@/lib/constants";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-white text-black">
      <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white p-6 md:block">
        <p className="mb-1 text-xs uppercase tracking-widest text-gray-400">
          Admin
        </p>
        <p className="mb-1 text-sm font-semibold text-black">{SITE.name}</p>
        <p className="mb-8 truncate text-xs text-gray-400">
          {session.user.email}
        </p>
        <nav className="space-y-1">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-black"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-10 space-y-3">
          <form action={adminLogout}>
            <button
              type="submit"
              className="text-xs text-gray-500 transition hover:text-black"
            >
              Sign out
            </button>
          </form>
          <Link
            href="/"
            className="block text-xs text-gray-400 transition hover:text-black"
          >
            ← Back to site
          </Link>
        </div>
      </aside>
      <div className="flex-1 bg-gray-50">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 md:hidden">
          <p className="font-semibold text-black">Admin · {SITE.name}</p>
          <form action={adminLogout}>
            <button type="submit" className="text-sm text-gray-500">
              Sign out
            </button>
          </form>
        </header>
        <div className="border-b border-gray-200 bg-white px-6 py-3 md:hidden">
          <nav className="flex flex-wrap gap-3 text-sm">
            {ADMIN_NAV.slice(0, 6).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-500 hover:text-black"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
