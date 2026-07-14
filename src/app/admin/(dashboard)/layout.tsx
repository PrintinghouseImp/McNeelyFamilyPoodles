import Link from "next/link";
import { ADMIN_NAV, SITE } from "@/lib/constants";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white text-black">
      <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white p-6 md:block">
        <p className="mb-1 text-xs uppercase tracking-widest text-gray-400">
          Admin
        </p>
        <p className="mb-8 text-sm font-semibold text-black">{SITE.name}</p>
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
        <Link
          href="/"
          className="mt-10 block text-xs text-gray-400 transition hover:text-black"
        >
          ← Back to site
        </Link>
      </aside>
      <div className="flex-1 bg-gray-50">
        <header className="border-b border-gray-200 bg-white px-6 py-4 md:hidden">
          <p className="font-semibold text-black">Admin · {SITE.name}</p>
        </header>
        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
