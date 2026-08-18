"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import {
  checkoutBodySchema,
  createAuthorizedCheckout,
  dollarsToCents,
} from "@/lib/checkout";
import { sendPaymentLinkEmail } from "@/lib/email";
import { optionalStr, str } from "@/lib/form";
import { db } from "@/lib/db";
import {
  cancelOpenPaymentCheckout,
  isStripeConfigured,
} from "@/lib/stripe";

export type AdminPaymentFormState = {
  error?: string;
  checkoutUrl?: string;
  paymentId?: string;
  emailSent?: boolean;
  emailMessage?: string;
};

function revalidatePayments() {
  revalidatePath("/admin/payments");
  revalidatePath("/admin/deposits");
  revalidatePath("/portal/deposits");
  revalidatePath("/portal");
  revalidatePath("/admin");
}

async function emailCheckoutLink(paymentId: string) {
  const payment = await db.paymentCheckout.findUnique({
    where: { id: paymentId },
    include: { puppy: { select: { name: true } } },
  });
  if (!payment?.checkoutUrl || !payment.customerEmail) {
    return {
      emailSent: false,
      emailMessage: "Cannot email — missing customer email or checkout URL.",
    };
  }

  const result = await sendPaymentLinkEmail({
    to: payment.customerEmail,
    customerName: payment.customerName,
    checkoutUrl: payment.checkoutUrl,
    kind: payment.kind,
    amountCents: payment.amountCents,
    puppyName: payment.puppy?.name,
    description: payment.description,
  });

  if (result.ok) {
    return {
      emailSent: true,
      emailMessage: `Payment link emailed to ${payment.customerEmail}.`,
    };
  }

  return {
    emailSent: false,
    emailMessage: result.error,
  };
}

/**
 * Admin form: create a Stripe Checkout link for deposit or full sale.
 * Optionally emails the customer (default on).
 */
export async function createAdminCheckoutSession(
  _prev: AdminPaymentFormState,
  formData: FormData,
): Promise<AdminPaymentFormState> {
  const session = await requireAdmin();

  if (!isStripeConfigured()) {
    return {
      error:
        "Stripe is not configured. Set STRIPE_SECRET_KEY in .env (see .env.example).",
    };
  }

  const kindRaw = str(formData, "kind");
  const amountDollars = optionalStr(formData, "amountDollars") ?? "";
  const puppyId = optionalStr(formData, "puppyId") ?? "";
  const userId = optionalStr(formData, "userId") ?? "";
  const depositRequestId = optionalStr(formData, "depositRequestId") ?? "";
  const customerEmail = optionalStr(formData, "customerEmail") ?? "";
  const customerName = optionalStr(formData, "customerName") ?? "";
  const description = optionalStr(formData, "description") ?? "";
  const redirectToStripe = str(formData, "redirectToStripe") === "1";
  // Checkbox posts "1" when checked; absent when unchecked
  const sendEmailFlag = str(formData, "sendEmail") === "1";

  const amountCents = dollarsToCents(amountDollars);
  if (amountDollars && amountCents == null) {
    return { error: "Enter a valid amount in dollars." };
  }

  const parsed = checkoutBodySchema.safeParse({
    kind: kindRaw,
    amountCents: amountCents ?? undefined,
    puppyId: puppyId || null,
    userId: userId || null,
    depositRequestId: depositRequestId || null,
    customerEmail: customerEmail || null,
    customerName: customerName || null,
    description: description || null,
  });

  if (!parsed.success) {
    return { error: "Please check the form fields and try again." };
  }

  try {
    const result = await createAuthorizedCheckout(parsed.data, {
      userId: session.user.id,
      role: "ADMIN",
      email: session.user.email,
      name: session.user.name,
      isAdmin: true,
    });

    revalidatePayments();

    let emailSent = false;
    let emailMessage: string | undefined;

    if (sendEmailFlag) {
      const mail = await emailCheckoutLink(result.paymentId);
      emailSent = mail.emailSent;
      emailMessage = mail.emailMessage;
    } else {
      emailMessage =
        "Email not sent (unchecked). Copy the link or use Resend email later.";
    }

    if (redirectToStripe) {
      redirect(result.checkoutUrl);
    }

    return {
      checkoutUrl: result.checkoutUrl,
      paymentId: result.paymentId,
      emailSent,
      emailMessage,
    };
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    return {
      error: err instanceof Error ? err.message : "Could not create checkout.",
    };
  }
}

/**
 * Admin: re-email an existing open checkout link.
 */
export async function resendPaymentLinkEmail(formData: FormData) {
  await requireAdmin();
  const paymentId = str(formData, "paymentId");
  if (!paymentId) throw new Error("Missing payment id");

  const payment = await db.paymentCheckout.findUnique({
    where: { id: paymentId },
  });
  if (!payment) throw new Error("Payment not found");
  if (payment.status !== "OPEN" || !payment.checkoutUrl) {
    throw new Error("Only open checkout links can be emailed.");
  }

  const mail = await emailCheckoutLink(paymentId);
  revalidatePayments();

  const q = mail.emailSent
    ? "emailed=1"
    : `emailError=${encodeURIComponent(mail.emailMessage ?? "failed")}`;
  redirect(`/admin/payments?${q}`);
}

/**
 * Admin: cancel an open Stripe Checkout session (expires on Stripe + DB).
 */
export async function cancelPaymentCheckout(formData: FormData) {
  await requireAdmin();
  const paymentId = str(formData, "paymentId");
  if (!paymentId) throw new Error("Missing payment id");

  try {
    const result = await cancelOpenPaymentCheckout(paymentId);
    revalidatePayments();
    const q = result.stripeExpired
      ? "cancelled=1"
      : result.note
        ? `cancelled=1&cancelNote=${encodeURIComponent(result.note)}`
        : "cancelled=1";
    redirect(`/admin/payments?${q}`);
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
    const message =
      err instanceof Error ? err.message : "Could not cancel payment.";
    redirect(
      `/admin/payments?cancelError=${encodeURIComponent(message)}`,
    );
  }
}

/**
 * Admin: start checkout for an existing deposit (opens Stripe).
 */
export async function startCheckoutForDeposit(formData: FormData) {
  const session = await requireAdmin();
  const depositRequestId = str(formData, "depositRequestId");
  if (!depositRequestId) throw new Error("Missing deposit request");
  const sendEmailFlag = formData.get("sendEmail") === "1";

  const result = await createAuthorizedCheckout(
    {
      kind: "DEPOSIT",
      depositRequestId,
    },
    {
      userId: session.user.id,
      role: "ADMIN",
      email: session.user.email,
      name: session.user.name,
      isAdmin: true,
    },
  );

  if (sendEmailFlag) {
    await emailCheckoutLink(result.paymentId);
  }

  revalidatePayments();
  redirect(result.checkoutUrl);
}
