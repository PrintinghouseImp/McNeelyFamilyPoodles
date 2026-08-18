import Link from "next/link";
import {
  cancelPaymentCheckout,
  resendPaymentLinkEmail,
} from "@/app/admin/actions/payments";
import { AdminCheckoutForm } from "@/components/payments/admin-checkout-form";
import { btnSecondary } from "@/components/admin/field";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { isEmailConfigured } from "@/lib/email";
import {
  formatDate,
  formatPriceCents,
  formatPuppyPrice,
} from "@/lib/format";
import {
  formatPaymentCheckoutStatus,
  formatPaymentKind,
  isStripeConfigured,
} from "@/lib/stripe";

export const metadata = { title: "Admin · Stripe payments" };

type Props = {
  searchParams: Promise<{
    emailed?: string;
    emailError?: string;
    cancelled?: string;
    cancelNote?: string;
    cancelError?: string;
  }>;
};

export default async function AdminPaymentsPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  const stripeOk = isStripeConfigured();
  const emailOk = isEmailConfigured();

  const [payments, puppies, customers] = await Promise.all([
    db.paymentCheckout.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        puppy: { select: { name: true } },
        user: { select: { email: true } },
      },
    }),
    db.puppy.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        priceCents: true,
        priceLabel: true,
      },
    }),
    db.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { email: "asc" },
      select: { id: true, email: true, name: true },
      take: 100,
    }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-black">
          Stripe Checkout
        </h1>
        <p className="mt-1 max-w-2xl text-gray-500">
          Generate Prebuilt Checkout links, email them to buyers, and they also
          appear in the customer portal when the buyer signs in with the same
          email.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Stripe:{" "}
          {stripeOk ? (
            <span className="font-medium text-emerald-800">configured</span>
          ) : (
            <span className="font-medium text-amber-800">
              STRIPE_SECRET_KEY missing
            </span>
          )}
          {" · "}
          Email:{" "}
          {emailOk ? (
            <span className="font-medium text-emerald-800">
              Resend configured
            </span>
          ) : (
            <span className="font-medium text-amber-800">
              RESEND_API_KEY missing
            </span>
          )}
        </p>
      </div>

      {params.emailed === "1" ? (
        <p
          className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          Payment link email sent.
        </p>
      ) : null}
      {params.emailError ? (
        <p
          className="mb-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="alert"
        >
          Email not sent: {params.emailError}
        </p>
      ) : null}
      {params.cancelled === "1" ? (
        <p
          className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          Payment session cancelled
          {params.cancelNote ? ` — ${params.cancelNote}` : "."} It no longer
          appears as open in the customer portal.
        </p>
      ) : null}
      {params.cancelError ? (
        <p
          className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          Cancel failed: {params.cancelError}
        </p>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-black">
            New checkout session
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Creates a Stripe-hosted payment page, emails the customer (optional),
            and shows the link in their portal.
          </p>
          <div className="mt-6">
            <AdminCheckoutForm
              emailConfigured={emailOk}
              puppies={puppies.map((p) => ({
                id: p.id,
                name: p.name,
                priceLabel:
                  formatPuppyPrice(p.priceCents, p.priceLabel) ?? "",
              }))}
              customers={customers}
            />
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-black">
            Recent sessions
          </h2>
          {payments.length === 0 ? (
            <p className="text-sm text-gray-500">No Stripe sessions yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
              {payments.map((p) => (
                <li key={p.id} className="px-4 py-3 text-sm">
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
                    {p.customerEmail ? ` · ${p.customerEmail}` : ""}
                    {p.user?.email ? ` · portal ${p.user.email}` : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {formatDate(p.createdAt, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {p.userId
                      ? " · visible in portal"
                      : p.customerEmail
                        ? " · portal if they sign in with this email"
                        : ""}
                  </p>
                  {p.status === "OPEN" ? (
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {p.checkoutUrl ? (
                        <a
                          href={p.checkoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-gray-700 underline-offset-2 hover:underline"
                        >
                          Open checkout link →
                        </a>
                      ) : null}
                      {p.checkoutUrl ? (
                        <form action={resendPaymentLinkEmail}>
                          <input type="hidden" name="paymentId" value={p.id} />
                          <button
                            type="submit"
                            className="text-xs font-medium text-gray-700 underline-offset-2 hover:underline"
                          >
                            Email link to customer
                          </button>
                        </form>
                      ) : null}
                      <form action={cancelPaymentCheckout}>
                        <input type="hidden" name="paymentId" value={p.id} />
                        <button
                          type="submit"
                          className="text-xs font-medium text-red-700 underline-offset-2 hover:underline"
                        >
                          Cancel session
                        </button>
                      </form>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-6 text-xs text-gray-400">
            Manual P2P deposits (Venmo/Zelle/PayPal) remain under{" "}
            <Link href="/admin/deposits" className="underline hover:text-black">
              Deposits
            </Link>
            .
          </p>
          <Link href="/admin/deposits" className={`${btnSecondary} mt-3`}>
            Deposit requests
          </Link>
        </div>
      </div>
    </div>
  );
}
