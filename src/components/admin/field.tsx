import type { ReactNode } from "react";

export function Field({
  label,
  name,
  children,
  hint,
}: {
  label: string;
  name?: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-gray-400">{hint}</span> : null}
      {name ? null : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-gray-500";

export const selectClass = inputClass;

export const textareaClass = `${inputClass} min-h-[100px]`;

export const checkClass = "h-4 w-4 rounded border-gray-300";

/** Primary CTA — strong hover/press so admin saves feel clearly interactive */
export const btnPrimary =
  "inline-flex cursor-pointer items-center justify-center rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white shadow-md ring-1 ring-black/10 transition-all duration-150 ease-out hover:scale-[1.04] hover:bg-gray-800 hover:shadow-xl hover:ring-black/25 active:scale-[0.96] active:bg-neutral-950 active:shadow-sm active:ring-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:pointer-events-none disabled:opacity-50";

export const btnSecondary =
  "inline-flex cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-150 ease-out hover:scale-[1.03] hover:border-gray-500 hover:bg-gray-50 hover:text-black hover:shadow-md active:scale-[0.97] active:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 disabled:pointer-events-none disabled:opacity-50";

export const btnDanger =
  "inline-flex cursor-pointer items-center justify-center rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-red-700 shadow-sm transition-all duration-150 ease-out hover:scale-[1.03] hover:border-red-300 hover:bg-red-50 hover:shadow-md active:scale-[0.97] active:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 disabled:pointer-events-none disabled:opacity-50";
