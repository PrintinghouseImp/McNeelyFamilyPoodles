"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuthorizedCheckout } from "@/lib/checkout";
import { str } from "@/lib/form";
import { requirePortalUser } from "@/lib/portal";
import { isStripeConfigured } from "@/lib/stripe";

/**
 * Customer: open Stripe Checkout for their deposit request or payment row.
 */
export async function payWithStripe(formData: FormData) {
  const session = await requirePortalUser();

  if (!isStripeConfigured()) {
    throw new Error("Card payments are not available right now.");
  }

  const depositRequestId = str(formData, "depositRequestId") || null;
  const paymentId = str(formData, "paymentId") || null;
  const kindRaw = str(formData, "kind") || "DEPOSIT";
  const kind = kindRaw === "FULL" ? "FULL" : "DEPOSIT";

  if (!depositRequestId && !paymentId) {
    throw new Error("Missing payment reference.");
  }

  const result = await createAuthorizedCheckout(
    {
      kind,
      depositRequestId,
      paymentId,
    },
    {
      userId: session.user.id,
      role: session.user.role ?? "CUSTOMER",
      email: session.user.email,
      name: session.user.name,
      isAdmin: session.user.role === "ADMIN",
    },
  );

  revalidatePath("/portal/deposits");
  revalidatePath("/portal");
  redirect(result.checkoutUrl);
}
