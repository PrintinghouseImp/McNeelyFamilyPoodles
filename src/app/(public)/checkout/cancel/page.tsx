import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";
import { db } from "@/lib/db";
import { isStripeConfigured, getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Checkout cancelled",
  description: "Your card payment was cancelled.",
};

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutCancelPage({ searchParams }: Props) {
  const params = await searchParams;
  const sessionId = params.session_id?.trim();

  let retryUrl: string | null = null;
  let paymentId: string | null = null;

  if (sessionId && isStripeConfigured()) {
    try {
      const payment = await db.paymentCheckout.findFirst({
        where: { stripeSessionId: sessionId },
      });
      if (payment) {
        paymentId = payment.id;
        if (payment.status === "OPEN" && payment.checkoutUrl) {
          // Prefer regenerating via portal; still expose last URL if open
          retryUrl = payment.checkoutUrl;
        }
      } else {
        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        paymentId = session.metadata?.paymentId ?? null;
      }
    } catch {
      // ignore — cancel page still works without details
    }
  }

  return (
    <>
      <PageHero
        title="Checkout cancelled"
        subtitle="No charge was made. You can try again anytime."
      />
      <SectionShell>
        <div className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-600">
            You left Stripe Checkout before completing payment. Your deposit
            request or sale link is still available in the customer portal
            {paymentId ? " (or from the link the breeder sent you)" : ""}.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/portal/deposits"
              className="inline-flex rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-900"
            >
              Back to deposits
            </Link>
            {retryUrl ? (
              <a
                href={retryUrl}
                className="inline-flex rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-black"
              >
                Resume checkout
              </a>
            ) : null}
            <Link
              href="/portal"
              className="inline-flex rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-black"
            >
              Portal home
            </Link>
          </div>
        </div>
      </SectionShell>
    </>
  );
}
