"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_LINKS, SITE } from "@/lib/constants";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-black md:text-2xl"
        >
          {SITE.name}
        </Link>

        <div className="hidden items-center space-x-8 md:flex">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "text-sm font-medium text-black"
                    : "text-sm text-gray-500 transition hover:text-black"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          className="text-2xl text-black md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="container mx-auto space-y-3 px-6 py-4 text-center">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    active
                      ? "block text-sm font-medium text-black"
                      : "block text-sm text-gray-500 hover:text-black"
                  }
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
