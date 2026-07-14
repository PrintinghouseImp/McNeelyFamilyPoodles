import Link from "next/link";
import { PORTAL_NAV, SITE } from "@/lib/constants";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Portal
            </p>
            <p className="font-semibold text-black">{SITE.name}</p>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm">
            {PORTAL_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-500 transition hover:text-black"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/"
              className="text-gray-400 transition hover:text-black"
            >
              Site
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
