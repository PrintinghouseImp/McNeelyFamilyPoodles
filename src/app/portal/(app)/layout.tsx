import Link from "next/link";
import { portalLogout } from "@/app/portal/actions";
import { PORTAL_NAV, SITE } from "@/lib/constants";
import { requirePortalUser } from "@/lib/portal";

export default async function PortalAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePortalUser();
  const displayName =
    session.user.name?.trim() || session.user.email || "Account";

  return (
    <>
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Customer portal
            </p>
            <p className="font-semibold text-black">{SITE.name}</p>
            <p className="mt-0.5 truncate text-xs text-gray-500">{displayName}</p>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
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
            <form action={portalLogout}>
              <button
                type="submit"
                className="text-gray-500 transition hover:text-black"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="container mx-auto flex-1 px-6 py-10">{children}</main>
    </>
  );
}
