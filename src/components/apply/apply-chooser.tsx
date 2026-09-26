"use client";

import Link from "next/link";
import { useEffect, useId, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function ApplyChooser({
  className,
  children,
  puppySlug,
}: {
  className?: string;
  children: ReactNode;
  puppySlug?: string;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const puppy = puppySlug
    ? `puppy=${encodeURIComponent(puppySlug)}`
    : "";
  const findHref = puppy ? `/apply?${puppy}` : "/apply";
  const guardianHref = puppy
    ? `/apply?intent=guardian&${puppy}`
    : "/apply?intent=guardian";

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      {open
        ? createPortal(
            <div
              className="fixed left-0 top-0 z-[80] flex w-full items-center justify-center overflow-x-clip"
              style={{ height: "100dvh" }}
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/40"
                aria-label="Close"
                onClick={() => setOpen(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className="relative shrink-0 overflow-x-hidden overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
                style={{
                  width: "min(28rem, calc(100vw - 2rem))",
                  maxHeight: "calc(100dvh - 2rem)",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 id={titleId} className="text-lg font-semibold text-black">
                    Apply
                  </h2>
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-black"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                  >
                    X
                  </button>
                </div>
                <div className="mt-5 flex flex-col gap-2">
                  <Link
                    href={findHref}
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-black hover:border-gray-400"
                    onClick={() => setOpen(false)}
                  >
                    Find a puppy
                  </Link>
                  <Link
                    href={guardianHref}
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-black hover:border-gray-400"
                    onClick={() => setOpen(false)}
                  >
                    Become a guardian
                  </Link>
                  <Link
                    href="/apply/rescue"
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-black hover:border-gray-400"
                    onClick={() => setOpen(false)}
                  >
                    Partner as rescue
                  </Link>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
