import type { PuppyStatus } from "@/generated/prisma/client";
import { formatPuppyStatus } from "@/lib/format";

/** Soft status chips — only place we use soft color on an otherwise B/W UI */
const STYLES: Record<PuppyStatus, string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  RESERVED: "bg-amber-50 text-amber-900 ring-amber-100",
  SOLD: "bg-gray-100 text-gray-600 ring-gray-200",
  GUARDIANSHIP: "bg-sky-50 text-sky-900 ring-sky-100",
  UNAVAILABLE: "bg-gray-50 text-gray-500 ring-gray-200",
};

type StatusBadgeProps = {
  status: PuppyStatus;
  className?: string;
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ring-1 ring-inset ${STYLES[status]} ${className}`}
    >
      {formatPuppyStatus(status)}
    </span>
  );
}
