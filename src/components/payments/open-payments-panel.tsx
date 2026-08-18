import Link from "next/link";
import { PayWithStripeButton } from "@/components/payments/pay-with-stripe-button";
import { formatPriceCents } from "@/lib/format";
import {
  formatPaymentCheckoutStatus,
  formatPaymentKind,
  isStripeConfigured,
} from "@/lib/stripe";

export type OpenPaymentRow = {
  id: string;
  kind: string;
  amountCents: number;
  status: string;
  checkoutUrl: string | null;
  puppy: { name: string; slug: string } | null;
};

/** Shared portal UI for active Stripe Checkout links. */
export function OpenPaymentsPanel({
  payments,
  title = "Payment due",
  compact = false,
}: {
  payments: OpenPaymentRow[];
  title?: string;
  compact?: boolean;
}) {
  if (payments.length === 0) return null;

  const stripeOk = isStripeConfigured();

  return (
    <section
      className={
        compact
          ? "rounded-2xl border border-amber-200 bg-amber-50/60 p-5"
          : "mt-8"
      }
      aria-label="Open payment links"
    >
      <h2
        className={
          compact
            ? "text-base font-semibold text-black"
            : "text-lg font-semibold text-black"
        }
      >
        {title}
        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
          {payments.length}
        </span>
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        Secure card payment via Stripe. You can also open the link from your
        email if the breeder sent one.
      </p>
      <ul
        className={
          compact
            ? "mt-4 space-y-3"
            : "mt-4 divide-y divide-gray-100 rounded-2xl border border-amber-100 bg-amber-50/40"
        }
      >
        {payments.map((p) => (
          <li
            key={p.id}
            className={
              compact
                ? "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-100 bg-white px-4 py-3 text-sm"
                : "flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm"
            }
          >
            <div>
              <p className="font-medium text-black">
                {formatPaymentKind(p.kind)}
                {p.puppy ? ` · ${p.puppy.name}` : ""}
              </p>
              <p className="mt-1 text-gray-600">
                {formatPriceCents(p.amountCents) ?? "—"} ·{" "}
                {formatPaymentCheckoutStatus(p.status)}
              </p>
              {p.puppy?.slug ? (
                <Link
                  href={`/puppies/${p.puppy.slug}`}
                  className="mt-1 inline-block text-xs text-gray-500 hover:text-black"
                >
                  View puppy →
                </Link>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {stripeOk ? (
                <PayWithStripeButton
                  paymentId={p.id}
                  kind={p.kind === "FULL" ? "FULL" : "DEPOSIT"}
                  label={
                    p.kind === "FULL"
                      ? "Pay full balance"
                      : "Pay deposit with card"
                  }
                />
              ) : null}
              {p.checkoutUrl ? (
                <a
                  href={p.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-black"
                >
                  Open link
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
