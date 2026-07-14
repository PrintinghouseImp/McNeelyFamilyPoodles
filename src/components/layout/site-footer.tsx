import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/constants";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="container mx-auto grid gap-8 px-6 py-12 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold text-black">{SITE.name}</p>
          <p className="mt-2 text-sm text-gray-500">{SITE.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 md:justify-center">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-500 transition hover:text-black"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="md:text-right">
          <Link
            href="/portal/login"
            className="text-sm text-gray-500 transition hover:text-black"
          >
            Customer portal →
          </Link>
          <p className="mt-2 text-xs text-gray-400">
            © {year} {SITE.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
