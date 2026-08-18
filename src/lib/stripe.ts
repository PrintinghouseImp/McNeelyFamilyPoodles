import Stripe from "stripe";
import type {
  PaymentCheckoutStatus,
  PaymentKind,
} from "@/generated/prisma/client";

/** App origin for success/cancel URLs (no trailing slash). */
export function getAppBaseUrl(): string {
  const explicit =
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    process.env.URL?.trim() ||
    process.env.DEPLOY_PRIME_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  return "http://localhost:3000";
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripePublishableKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? "";
}

let stripeSingleton: Stripe | null = null;

/** Server-only Stripe client. Throws if secret key is missing. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env (see .env.example).",
    );
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key, {
      // Match stripe package LatestApiVersion (see node_modules/stripe).
      apiVersion: "2026-06-24.dahlia",
      typescript: true,
    });
  }
  return stripeSingleton;
}

export function formatPaymentKind(kind: PaymentKind | string): string {
  return kind === "FULL" ? "Full payment" : "Deposit";
}

export function formatPaymentCheckoutStatus(
  status: PaymentCheckoutStatus | string,
): string {
  const labels: Record<string, string> = {
    OPEN: "Open",
    COMPLETE: "Paid",
    EXPIRED: "Expired",
    CANCELLED: "Cancelled",
  };
  return labels[status] ?? status;
}

export type CreateCheckoutInput = {
  kind: PaymentKind;
  amountCents: number;
  currency?: string;
  description?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  puppyId?: string | null;
  puppyName?: string | null;
  userId?: string | null;
  depositRequestId?: string | null;
  createdByUserId?: string | null;
  /** Existing PaymentCheckout row to reuse (e.g. retry). */
  paymentId?: string | null;
};

export type CreateCheckoutResult = {
  paymentId: string;
  stripeSessionId: string;
  checkoutUrl: string;
};

/**
 * Create a Stripe Checkout Session (mode=payment) and persist PaymentCheckout.
 * Caller is responsible for auth and amount validation.
 */
export async function createStripeCheckoutSession(
  input: CreateCheckoutInput,
): Promise<CreateCheckoutResult> {
  if (!Number.isInteger(input.amountCents) || input.amountCents < 50) {
    throw new Error("Amount must be at least $0.50 (50 cents).");
  }

  const { db } = await import("@/lib/db");
  const stripe = getStripe();
  const base = getAppBaseUrl();
  const currency = (input.currency ?? "usd").toLowerCase();

  const productName =
    input.kind === "FULL"
      ? input.puppyName
        ? `Full payment — ${input.puppyName}`
        : "Full puppy payment"
      : input.puppyName
        ? `Deposit — ${input.puppyName}`
        : "Puppy reservation deposit";

  const description =
    input.description?.trim() ||
    (input.kind === "FULL"
      ? "Full purchase payment for McNeely Family Poodles"
      : "Reservation deposit for McNeely Family Poodles");

  // Upsert our DB row first so metadata always has a paymentId.
  const payment = input.paymentId
    ? await db.paymentCheckout.update({
        where: { id: input.paymentId },
        data: {
          kind: input.kind,
          amountCents: input.amountCents,
          currency,
          description,
          customerEmail: input.customerEmail?.trim() || null,
          customerName: input.customerName?.trim() || null,
          puppyId: input.puppyId || null,
          userId: input.userId || null,
          depositRequestId: input.depositRequestId || null,
          createdByUserId: input.createdByUserId || null,
          status: "OPEN",
        },
      })
    : await db.paymentCheckout.create({
        data: {
          kind: input.kind,
          amountCents: input.amountCents,
          currency,
          description,
          customerEmail: input.customerEmail?.trim() || null,
          customerName: input.customerName?.trim() || null,
          puppyId: input.puppyId || null,
          userId: input.userId || null,
          depositRequestId: input.depositRequestId || null,
          createdByUserId: input.createdByUserId || null,
          status: "OPEN",
        },
      });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: input.customerEmail?.trim() || undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: input.amountCents,
          product_data: {
            name: productName,
            description,
          },
        },
      },
    ],
    success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      paymentId: payment.id,
      kind: input.kind,
      puppyId: input.puppyId ?? "",
      userId: input.userId ?? "",
      depositRequestId: input.depositRequestId ?? "",
    },
    payment_intent_data: {
      metadata: {
        paymentId: payment.id,
        kind: input.kind,
        puppyId: input.puppyId ?? "",
      },
    },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  await db.paymentCheckout.update({
    where: { id: payment.id },
    data: {
      stripeSessionId: session.id,
      checkoutUrl: session.url,
      status: "OPEN",
    },
  });

  if (input.depositRequestId) {
    await db.depositRequest.update({
      where: { id: input.depositRequestId },
      data: { status: "AWAITING_PAYMENT" },
    });
  }

  return {
    paymentId: payment.id,
    stripeSessionId: session.id,
    checkoutUrl: session.url,
  };
}

/**
 * Mark PaymentCheckout (and linked DepositRequest) complete from a Stripe session.
 */
export async function markCheckoutCompleteFromSession(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const { db } = await import("@/lib/db");

  const paymentId = session.metadata?.paymentId;
  const sessionId = session.id;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const payment = paymentId
    ? await db.paymentCheckout.findUnique({ where: { id: paymentId } })
    : await db.paymentCheckout.findFirst({
        where: { stripeSessionId: sessionId },
      });

  if (!payment) {
    console.warn("[stripe] No PaymentCheckout for session", sessionId);
    return;
  }

  if (payment.status === "COMPLETE") return;

  const paid =
    session.payment_status === "paid" ||
    session.status === "complete";

  if (!paid) return;

  await db.paymentCheckout.update({
    where: { id: payment.id },
    data: {
      status: "COMPLETE",
      stripeSessionId: sessionId,
      stripePaymentIntentId: paymentIntentId,
      paidAt: new Date(),
      customerEmail:
        payment.customerEmail ||
        session.customer_details?.email ||
        session.customer_email ||
        null,
    },
  });

  if (payment.depositRequestId) {
    await db.depositRequest.update({
      where: { id: payment.depositRequestId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        method: "STRIPE",
      },
    });
  }
}

export async function markCheckoutExpiredOrCancelled(
  session: Stripe.Checkout.Session,
  status: "EXPIRED" | "CANCELLED",
): Promise<void> {
  const { db } = await import("@/lib/db");
  const paymentId = session.metadata?.paymentId;
  const payment = paymentId
    ? await db.paymentCheckout.findUnique({ where: { id: paymentId } })
    : await db.paymentCheckout.findFirst({
        where: { stripeSessionId: session.id },
      });

  if (!payment || payment.status === "COMPLETE") return;

  await db.paymentCheckout.update({
    where: { id: payment.id },
    data: { status },
  });
}

/**
 * Admin cancel: expire Stripe Checkout Session (if any) and mark row CANCELLED.
 * Linked deposit requests that were AWAITING_PAYMENT go back to REQUESTED.
 */
export async function cancelOpenPaymentCheckout(paymentId: string): Promise<{
  ok: true;
  stripeExpired: boolean;
  note?: string;
}> {
  const { db } = await import("@/lib/db");

  const payment = await db.paymentCheckout.findUnique({
    where: { id: paymentId },
  });
  if (!payment) {
    throw new Error("Payment not found.");
  }
  if (payment.status === "COMPLETE") {
    throw new Error("Paid sessions cannot be cancelled.");
  }
  if (payment.status === "CANCELLED" || payment.status === "EXPIRED") {
    return { ok: true, stripeExpired: false, note: "Already closed." };
  }

  let stripeExpired = false;
  let note: string | undefined;

  if (payment.stripeSessionId && isStripeConfigured()) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(
        payment.stripeSessionId,
      );
      if (session.status === "open") {
        await stripe.checkout.sessions.expire(payment.stripeSessionId);
        stripeExpired = true;
      } else if (session.status === "complete") {
        throw new Error(
          "Stripe reports this session as already paid. Refresh and check status.",
        );
      } else {
        note = `Stripe session was already ${session.status ?? "closed"}.`;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Stripe error";
      // Test/placeholder sessions (cs_test_placeholder) will fail — still cancel locally
      if (message.includes("already paid")) throw err;
      console.warn("[stripe] expire session failed:", message);
      note = `Local cancel only (Stripe expire failed: ${message}).`;
    }
  }

  await db.paymentCheckout.update({
    where: { id: payment.id },
    data: {
      status: "CANCELLED",
      checkoutUrl: null,
    },
  });

  if (payment.depositRequestId) {
    const dep = await db.depositRequest.findUnique({
      where: { id: payment.depositRequestId },
      select: { status: true },
    });
    if (dep?.status === "AWAITING_PAYMENT") {
      await db.depositRequest.update({
        where: { id: payment.depositRequestId },
        data: { status: "REQUESTED" },
      });
    }
  }

  return { ok: true, stripeExpired, note };
}
