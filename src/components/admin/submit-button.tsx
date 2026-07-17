"use client";

import { useFormStatus } from "react-dom";
import { btnPrimary } from "@/components/admin/field";

type Props = {
  /** Idle label, e.g. "Save changes" */
  children: string;
  /** Pending label, default "Saving…" */
  pendingLabel?: string;
  className?: string;
};

/**
 * Form submit button with clear hover/press styles and a "Saving…" state
 * so admins can tell a click registered.
 */
export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  className = "",
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${btnPrimary} min-w-[9.5rem] ${pending ? "scale-100 shadow-inner ring-2 ring-white/30" : ""} ${className}`}
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
            aria-hidden
          />
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
