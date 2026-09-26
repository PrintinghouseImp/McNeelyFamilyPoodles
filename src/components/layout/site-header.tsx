"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ApplyChooser } from "@/components/apply/apply-chooser";
import { HEADER_NAV } from "@/lib/constants";

const LOGO = "https://images.mcneelyfamilypoodles.com/home/logo.png";

function linkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navClass(active: boolean) {
  return active
    ? "text-sm font-medium text-black"
    : "text-sm text-gray-500 transition hover:text-black";
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="site-header sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-nowrap items-center gap-3 px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex min-w-0 flex-col items-start gap-0.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="" className="h-8 w-auto max-w-full" />
          <span className="max-w-full font-wordmark text-sm leading-tight text-black sm:text-base">
            McNeely Family Poodles
          </span>
        </Link>

        <nav className="hidden items-center gap-4 md:flex lg:gap-6" aria-label="Primary">
          {HEADER_NAV.map((link) => {
            const active = linkActive(pathname, link.href);
            return (
              <Link key={link.href} href={link.href} className={navClass(active)}>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/portal/login"
            className="hidden text-sm text-gray-500 transition hover:text-black md:inline"
          >
            Log in
          </Link>
          <ApplyChooser className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-900">
            Apply
          </ApplyChooser>
          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center md:hidden"
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="flex w-5 flex-col gap-1" aria-hidden="true">
              <span className="h-0.5 w-full bg-black" />
              <span className="h-0.5 w-full bg-black" />
              <span className="h-0.5 w-full bg-black" />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="site-menu"
          aria-label="Mobile"
          className="border-t border-gray-200 bg-white md:hidden"
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-2 sm:px-6">
            {HEADER_NAV.map((link) => {
              const active = linkActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-2 ${navClass(active)}`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/portal/login"
              className="py-2 text-sm text-gray-500 transition hover:text-black"
              onClick={() => setOpen(false)}
            >
              Log in
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
