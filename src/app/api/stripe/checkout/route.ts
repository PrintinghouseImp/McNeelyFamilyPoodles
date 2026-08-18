import { NextResponse } from "next/server";
import {
  checkoutBodySchema,
  createAuthorizedCheckout,
  requireCheckoutActor,
} from "@/lib/checkout";
import { isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/stripe/checkout
 * Create a Stripe Prebuilt Checkout Session (deposit or full payment).
 *
 * Body JSON:
 *   kind: "DEPOSIT" | "FULL"
 *   amountDollars?: string | number
 *   amountCents?: number
 *   puppyId?, userId?, depositRequestId?, paymentId?
 *   customerEmail?, customerName?, description?
 *
 * Auth: signed-in admin (any sale) or customer (own deposits / open links).
 */
export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe is not configured on this server." },
        { status: 503 },
      );
    }

    const actor = await requireCheckoutActor();
    if (!actor) {
      return NextResponse.json(
        { error: "Sign in required." },
        { status: 401 },
      );
    }

    const json = await request.json().catch(() => null);
    const parsed = checkoutBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid checkout request.",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const result = await createAuthorizedCheckout(parsed.data, actor);
    return NextResponse.json({
      ok: true,
      paymentId: result.paymentId,
      sessionId: result.stripeSessionId,
      url: result.checkoutUrl,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not create checkout session.";
    const status =
      message.includes("not found") || message.includes("cannot")
        ? 403
        : message.includes("required") || message.includes("valid amount")
          ? 400
          : 500;
    console.error("[stripe/checkout]", message);
    return NextResponse.json({ error: message }, { status });
  }
}
