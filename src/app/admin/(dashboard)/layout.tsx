import Link from "next/link";
import { adminLogout } from "@/app/admin/actions/auth";
import { requireAdmin } from "@/lib/admin";
import { ADMIN_NAV, SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-hidden bg-white text-black">
      <aside className="hidden w-64 shrink-0 overflow-x-hidden border-r border-gray-200 bg-white p-6 md:block">
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
              className="block break-words rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-black"
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
      <div className="min-w-0 max-w-full flex-1 overflow-x-hidden bg-gray-50">
        <header className="flex min-w-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-4 sm:px-6 md:hidden">
          <p className="min-w-0 break-words font-semibold text-black">
            Admin · {SITE.name}
          </p>
          <form action={adminLogout}>
            <button type="submit" className="text-sm text-gray-500">
              Sign out
            </button>
          </form>
        </header>
        <div className="min-w-0 border-b border-gray-200 bg-white px-4 py-3 sm:px-6 md:hidden">
          <nav className="flex max-w-full flex-wrap gap-x-3 gap-y-2 text-sm">
            {ADMIN_NAV.map((item) => (
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
        <main className="min-w-0 max-w-full overflow-x-hidden p-4 sm:p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
