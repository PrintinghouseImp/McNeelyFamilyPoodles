"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ApplyChooser } from "@/components/apply/apply-chooser";
import { HEADER_NAV } from "@/lib/constants";

const LOGO = "https://images.mcneelyfamilypoodles.com/home/logo.png";

function linkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container mx-auto flex items-center gap-4 px-6 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="" className="h-10 w-auto" />
          <span className="font-wordmark text-base leading-tight text-black sm:text-lg">
            McNeely Family Poodles
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {HEADER_NAV.map((link) => {
            const active = linkActive(pathname, link.href);
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

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/portal/login"
            className="text-sm text-gray-500 transition hover:text-black"
          >
            Log in
          </Link>
          <ApplyChooser className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-900">
            Apply
          </ApplyChooser>
          <button
            type="button"
            className="text-2xl leading-none text-black md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="container mx-auto space-y-3 px-6 py-4">
            {HEADER_NAV.map((link) => {
              const active = linkActive(pathname, link.href);
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
      ) : null}
    </nav>
  );
}
