import { NextResponse } from "next/server";
import {
  getStripe,
  markCheckoutCompleteFromSession,
  markCheckoutExpiredOrCancelled,
} from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/stripe/webhook
 * Stripe → app: mark deposits/sales paid when Checkout completes.
 *
 * Local: stripe listen --forward-to localhost:3000/api/stripe/webhook
 * Set STRIPE_WEBHOOK_SECRET from the CLI or Dashboard endpoint.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripe();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("[stripe/webhook] signature failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        await markCheckoutCompleteFromSession(session);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object;
        await markCheckoutExpiredOrCancelled(session, "EXPIRED");
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object;
        await markCheckoutExpiredOrCancelled(session, "CANCELLED");
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[stripe/webhook] handler error:", err);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
