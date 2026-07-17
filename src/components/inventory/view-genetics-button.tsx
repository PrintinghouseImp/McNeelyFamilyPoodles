"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  hasGeneticsContent,
  parseGeneticsData,
  type GeneticsData,
} from "@/lib/genetics";

type Props = {
  dogName: string;
  geneticsData?: unknown;
  geneticsText?: string | null;
  className?: string;
};

export function ViewGeneticsButton({
  dogName,
  geneticsData,
  geneticsText,
  className = "",
}: Props) {
  const data = parseGeneticsData(geneticsData, geneticsText);
  if (!hasGeneticsContent(data)) return null;

  return (
    <GeneticsModalTrigger
      dogName={dogName}
      data={data}
      className={className}
    />
  );
}

function GeneticsModalTrigger({
  dogName,
  data,
  className,
}: {
  dogName: string;
  data: GeneticsData;
  className: string;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      previouslyFocused.current?.focus?.();
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-black ${className}`}
      >
        View Genetics
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close genetics dialog"
            className="absolute inset-0 bg-black/50 transition"
            onClick={close}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-[101] flex max-h-[min(90vh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Genetics
                </p>
                <h2
                  id={titleId}
                  className="mt-0.5 truncate text-lg font-semibold tracking-tight text-black"
                >
                  {dogName}
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-xl leading-none text-gray-500 transition hover:border-gray-300 hover:text-black"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-5 sm:px-6">
              {data.entries.length > 0 ? (
                <dl className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                  {data.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-4"
                    >
                      <dt className="text-sm font-medium text-gray-700">
                        {entry.label}
                      </dt>
                      <dd className="font-mono text-sm text-gray-900 break-words">
                        {entry.value.trim() || (
                          <span className="font-sans text-gray-400">—</span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {data.notes?.trim() ? (
                <div className={data.entries.length > 0 ? "mt-5" : ""}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Notes
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {data.notes}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="border-t border-gray-100 px-5 py-3 sm:px-6">
              <button
                type="button"
                onClick={close}
                className="w-full rounded-full border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-black sm:w-auto sm:px-6"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
