import Link from "next/link";
import {
  FOOTER_ACCOUNT_LINKS,
  FOOTER_MORE_LINKS,
  HEADER_NAV,
  SITE,
} from "@/lib/constants";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="container mx-auto grid gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-semibold text-black">{SITE.name}</p>
          <p className="mt-2 text-sm text-gray-500">{SITE.tagline}</p>
          <p className="mt-4 text-xs text-gray-400">
            © {year} {SITE.name}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Explore
          </p>
          <ul className="mt-3 space-y-2">
            {HEADER_NAV.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-500 transition hover:text-black"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            More
          </p>
          <ul className="mt-3 space-y-2">
            {FOOTER_MORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-500 transition hover:text-black"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Account
          </p>
          <ul className="mt-3 space-y-2">
            {FOOTER_ACCOUNT_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-500 transition hover:text-black"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
