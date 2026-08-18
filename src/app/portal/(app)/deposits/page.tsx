import Link from "next/link";
import { PaymentHandlesCard } from "@/components/deposits/payment-handles";
import { OpenPaymentsPanel } from "@/components/payments/open-payments-panel";
import { PayWithStripeButton } from "@/components/payments/pay-with-stripe-button";
import { requirePortalUser } from "@/lib/portal";
import { getPortalPayments } from "@/lib/portal-payments";
import { db } from "@/lib/db";
import {
  formatDate,
  formatDepositMethod,
  formatDepositStatus,
  formatPriceCents,
} from "@/lib/format";
import { getPaymentHandles } from "@/lib/settings";
import {
  formatPaymentCheckoutStatus,
  formatPaymentKind,
  isStripeConfigured,
} from "@/lib/stripe";

export const metadata = { title: "Deposits & payments" };

type Props = {
  searchParams: Promise<{ submitted?: string }>;
};

export default async function PortalDepositsPage({ searchParams }: Props) {
  const session = await requirePortalUser();
  const params = await searchParams;
  const stripeOk = isStripeConfigured();
  const userId = session.user.id;
  const email = session.user.email;

  const [deposits, payments, handles] = await Promise.all([
    db.depositRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        puppy: { select: { name: true, slug: true } },
        stripePayment: true,
      },
    }),
    getPortalPayments(userId, email),
    getPaymentHandles(),
  ]);

  const openPayments = payments.filter((p) => p.status === "OPEN");
  const pastPayments = payments.filter((p) => p.status !== "OPEN");

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            Deposits & payments
          </h1>
          <p className="mt-2 max-w-2xl text-gray-500">
            Pay a reservation deposit by card (Stripe) or request Venmo / Zelle
            / PayPal. Checkout links the breeder emails you also appear here
            when you&apos;re signed in.
          </p>
        </div>
        <Link
          href="/portal/deposits/new"
          className="inline-flex rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-900"
        >
          New deposit
        </Link>
      </div>

      {params.submitted === "1" ? (
        <p
          className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          Deposit request submitted. For person-to-person methods, send payment
          using the handles below; for card, use{" "}
          <strong className="font-medium">Pay with card</strong> if you were not
          redirected automatically.
        </p>
      ) : null}

      <OpenPaymentsPanel
        payments={openPayments}
        title="Active payment links"
      />

      <div className="mt-8">
        <PaymentHandlesCard handles={handles} />
      </div>

      <h2 className="mt-10 text-lg font-semibold text-black">
        Deposit requests
      </h2>

      {deposits.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No deposit requests yet.</p>
          <Link
            href="/portal/deposits/new"
            className="mt-4 inline-flex rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-900"
          >
            Request a deposit
          </Link>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
          {deposits.map((d) => {
            const canPayCard =
              stripeOk &&
              d.status !== "PAID" &&
              d.status !== "CANCELLED" &&
              d.status !== "REFUNDED" &&
              (d.method === "STRIPE" ||
                d.stripePayment?.status === "OPEN" ||
                (d.amountCents != null && d.amountCents >= 50));

            return (
              <li key={d.id} className="px-5 py-4 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium text-black">
                    {d.puppy?.name ?? "Deposit request"} ·{" "}
                    {formatDepositMethod(d.method)}
                  </p>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {formatDepositStatus(d.status)}
                  </span>
                </div>
                <p className="mt-1 text-gray-500">
                  {formatPriceCents(d.amountCents) ?? "Amount TBD"}
                  {" · "}
                  {formatDate(d.createdAt) ?? "—"}
                  {d.paidAt
                    ? ` · Paid ${formatDate(d.paidAt) ?? ""}`.trim()
                    : null}
                </p>
                {d.customerNote ? (
                  <p className="mt-2 line-clamp-2 text-gray-600">
                    {d.customerNote}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {canPayCard ? (
                    <PayWithStripeButton
                      depositRequestId={d.id}
                      kind="DEPOSIT"
                      label="Pay with card (Stripe)"
                    />
                  ) : null}
                  {d.puppy?.slug ? (
                    <Link
                      href={`/puppies/${d.puppy.slug}`}
                      className="text-xs text-gray-500 hover:text-black"
                    >
                      View puppy →
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {pastPayments.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-black">
            Payment history
          </h2>
          <ul className="mt-4 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
            {pastPayments.map((p) => (
              <li key={p.id} className="px-5 py-4 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium text-black">
                    {formatPaymentKind(p.kind)}
                    {p.puppy ? ` · ${p.puppy.name}` : ""}
                  </p>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                    {formatPaymentCheckoutStatus(p.status)}
                  </span>
                </div>
                <p className="mt-1 text-gray-500">
                  {formatPriceCents(p.amountCents) ?? "—"}
                  {" · "}
                  {formatDate(p.paidAt ?? p.createdAt) ?? "—"}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
