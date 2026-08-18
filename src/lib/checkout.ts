import { z } from "zod";
import type { PaymentKind } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { resolvePortalUserIdByEmail } from "@/lib/portal-payments";
import {
  createStripeCheckoutSession,
  isStripeConfigured,
  type CreateCheckoutResult,
} from "@/lib/stripe";

export const checkoutBodySchema = z.object({
  kind: z.enum(["DEPOSIT", "FULL"]),
  /** USD dollars string or number, e.g. "500" or 500 */
  amountDollars: z.union([z.string(), z.number()]).optional(),
  /** Prefer cents when calling from code */
  amountCents: z.number().int().positive().optional(),
  puppyId: z.string().min(1).optional().nullable(),
  userId: z.string().min(1).optional().nullable(),
  depositRequestId: z.string().min(1).optional().nullable(),
  customerEmail: z.string().email().optional().nullable().or(z.literal("")),
  customerName: z.string().max(120).optional().nullable().or(z.literal("")),
  description: z.string().max(500).optional().nullable().or(z.literal("")),
  /** Reuse an open PaymentCheckout row */
  paymentId: z.string().min(1).optional().nullable(),
});

export type CheckoutBody = z.infer<typeof checkoutBodySchema>;

export function dollarsToCents(value: string | number | undefined): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export type CheckoutAuthContext = {
  userId: string;
  role: string;
  email?: string | null;
  name?: string | null;
  isAdmin: boolean;
};

export async function requireCheckoutActor(): Promise<CheckoutAuthContext | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.role) return null;
  return {
    userId: session.user.id,
    role: session.user.role,
    email: session.user.email,
    name: session.user.name,
    isAdmin: session.user.role === "ADMIN",
  };
}

/**
 * Authorize + create a Stripe Checkout Session for deposit or full payment.
 */
export async function createAuthorizedCheckout(
  raw: CheckoutBody,
  actor: CheckoutAuthContext,
): Promise<CreateCheckoutResult> {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing).");
  }

  const kind = raw.kind as PaymentKind;
  let amountCents =
    raw.amountCents ??
    dollarsToCents(raw.amountDollars) ??
    null;

  let puppyId = raw.puppyId || null;
  let userId = raw.userId || null;
  let depositRequestId = raw.depositRequestId || null;
  let customerEmail =
    (raw.customerEmail && String(raw.customerEmail).trim()) ||
    actor.email ||
    null;
  let customerName =
    (raw.customerName && String(raw.customerName).trim()) ||
    actor.name ||
    null;
  let puppyName: string | null = null;
  let paymentId = raw.paymentId || null;
  let description = raw.description?.trim() || null;

  // ── Resume existing open payment ─────────────────────────────────────────
  if (paymentId) {
    const existing = await db.paymentCheckout.findUnique({
      where: { id: paymentId },
      include: { puppy: { select: { name: true } } },
    });
    if (!existing) throw new Error("Payment not found.");
    if (existing.status === "COMPLETE") {
      throw new Error("This payment is already complete.");
    }
    if (!actor.isAdmin && existing.userId !== actor.userId) {
      throw new Error("You cannot pay this checkout link.");
    }
    if (existing.checkoutUrl && existing.stripeSessionId && existing.status === "OPEN") {
      // Prefer a fresh session so expired Stripe links still work
    }
    amountCents = amountCents ?? existing.amountCents;
    puppyId = puppyId ?? existing.puppyId;
    userId = existing.userId ?? userId;
    depositRequestId = existing.depositRequestId ?? depositRequestId;
    customerEmail = customerEmail || existing.customerEmail;
    customerName = customerName || existing.customerName;
    puppyName = existing.puppy?.name ?? null;
    description = description || existing.description;
  }

  // ── From deposit request ─────────────────────────────────────────────────
  if (depositRequestId) {
    const dep = await db.depositRequest.findUnique({
      where: { id: depositRequestId },
      include: {
        puppy: { select: { id: true, name: true, priceCents: true } },
        stripePayment: true,
      },
    });
    if (!dep) throw new Error("Deposit request not found.");
    if (!actor.isAdmin && dep.userId !== actor.userId) {
      throw new Error("You cannot pay for this deposit request.");
    }
    if (dep.status === "PAID") {
      throw new Error("This deposit is already marked paid.");
    }
    if (dep.status === "CANCELLED" || dep.status === "REFUNDED") {
      throw new Error("This deposit request is closed.");
    }

    // Reuse linked open payment if present
    if (dep.stripePayment && dep.stripePayment.status !== "COMPLETE") {
      paymentId = dep.stripePayment.id;
    }

    amountCents = amountCents ?? dep.amountCents;
    puppyId = puppyId ?? dep.puppyId;
    userId = dep.userId ?? userId ?? actor.userId;
    customerEmail = customerEmail || dep.email;
    customerName = customerName || dep.name;
    puppyName = dep.puppy?.name ?? puppyName;
  }

  // ── Customers may only create DEPOSIT for themselves ─────────────────────
  if (!actor.isAdmin) {
    if (kind === "FULL" && !paymentId && !depositRequestId) {
      throw new Error("Only the breeder can create full-sale checkout links.");
    }
    userId = actor.userId;
    if (!customerEmail) customerEmail = actor.email ?? null;
    if (!customerName) customerName = actor.name ?? null;
  }

  // ── Resolve puppy + default FULL amount from list price ──────────────────
  if (puppyId) {
    const puppy = await db.puppy.findUnique({
      where: { id: puppyId },
      select: { id: true, name: true, priceCents: true, isPublished: true },
    });
    if (!puppy) throw new Error("Puppy not found.");
    puppyName = puppy.name;
    if (kind === "FULL" && amountCents == null && puppy.priceCents != null) {
      amountCents = puppy.priceCents;
    }
  }

  if (amountCents == null || amountCents < 50) {
    throw new Error(
      "Enter a valid amount of at least $0.50 (or set the puppy list price for full payments).",
    );
  }

  if (!customerEmail) {
    throw new Error("Customer email is required for Checkout.");
  }

  // Link portal account by email so the customer sees the link when signed in
  if (!userId) {
    userId = await resolvePortalUserIdByEmail(customerEmail, null);
  } else {
    userId = await resolvePortalUserIdByEmail(customerEmail, userId);
  }

  return createStripeCheckoutSession({
    kind,
    amountCents,
    description,
    customerEmail,
    customerName,
    puppyId,
    puppyName,
    userId,
    depositRequestId,
    createdByUserId: actor.isAdmin ? actor.userId : null,
    paymentId,
  });
}
