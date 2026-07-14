import type { PuppyStatus, Sex } from "@/generated/prisma/client";

/** Format USD cents for display (e.g. 120000 → "$1,200"). */
export function formatPriceCents(cents: number | null | undefined): string | null {
  if (cents == null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** Prefer free-text price label, then cents. */
export function formatPuppyPrice(
  priceCents: number | null | undefined,
  priceLabel: string | null | undefined,
): string | null {
  if (priceLabel?.trim()) return priceLabel.trim();
  return formatPriceCents(priceCents);
}

export function formatSex(sex: Sex): string {
  return sex === "MALE" ? "Male" : "Female";
}

const STATUS_LABELS: Record<PuppyStatus, string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  SOLD: "Sold",
  GUARDIANSHIP: "Guardianship",
  UNAVAILABLE: "Unavailable",
};

export function formatPuppyStatus(status: PuppyStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function formatDate(
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  },
): string | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", options).format(d);
}
