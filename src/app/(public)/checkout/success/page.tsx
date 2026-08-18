import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";
import { db } from "@/lib/db";
import {
  formatPaymentCheckoutStatus,
  formatPaymentKind,
  getStripe,
  isStripeConfigured,
  markCheckoutCompleteFromSession,
} from "@/lib/stripe";
import { formatPriceCents } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Payment successful",
  description: "Thank you for your payment.",
};

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const sessionId = params.session_id?.trim();

  let payment: {
    id: string;
    kind: string;
    status: string;
    amountCents: number;
    puppy?: { name: string; slug: string } | null;
  } | null = null;
  let syncError: string | null = null;

  if (sessionId && isStripeConfigured()) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (
        session.payment_status === "paid" ||
        session.status === "complete"
      ) {
        await markCheckoutCompleteFromSession(session);
      }
      payment = await db.paymentCheckout.findFirst({
        where: {
          OR: [
            { stripeSessionId: sessionId },
            ...(session.metadata?.paymentId
              ? [{ id: session.metadata.paymentId }]
              : []),
          ],
        },
        include: {
          puppy: { select: { name: true, slug: true } },
        },
      });
    } catch (err) {
      syncError =
        err instanceof Error ? err.message : "Could not verify payment.";
      console.error("[checkout/success]", err);
    }
  }

  return (
    <>
      <PageHero
        title="Payment received"
        subtitle="Thank you — your card payment went through."
      />
      <SectionShell>
        <div className="mx-auto max-w-lg rounded-2xl border border-emerald-100 bg-emerald-50/50 p-8 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-800">
            Success
          </p>
          {payment ? (
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium text-black">
                  {formatPaymentKind(payment.kind)}
                </span>
                {payment.puppy ? ` · ${payment.puppy.name}` : null}
              </p>
              <p>
                {formatPriceCents(payment.amountCents) ?? "—"} ·{" "}
                {formatPaymentCheckoutStatus(payment.status)}
              </p>
            </div>
          ) : sessionId ? (
            <p className="mt-4 text-sm text-gray-600">
              Stripe confirmed the session
              {syncError ? ` (sync note: ${syncError})` : ""}. The breeder will
              see the payment in admin.
            </p>
          ) : (
            <p className="mt-4 text-sm text-gray-600">
              If you completed checkout, you&apos;re all set. You can close this
              tab or return to the portal.
            </p>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/portal/deposits"
              className="inline-flex rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-900"
            >
              View my payments
            </Link>
            <Link
              href="/portal"
              className="inline-flex rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-black"
            >
              Portal home
            </Link>
            {payment?.puppy?.slug ? (
              <Link
                href={`/puppies/${payment.puppy.slug}`}
                className="inline-flex rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-black"
              >
                View puppy
              </Link>
            ) : null}
          </div>
        </div>
      </SectionShell>
    </>
  );
}
