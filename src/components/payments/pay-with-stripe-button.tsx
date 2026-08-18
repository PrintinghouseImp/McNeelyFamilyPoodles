"use client";

import { useFormStatus } from "react-dom";
import { payWithStripe } from "@/app/portal/actions/payments";
import { btnPrimary } from "@/components/admin/field";

function SubmitLabel({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <>{pending ? "Redirecting to Stripe…" : label}</>;
}

/** Portal form button: redirects to Stripe Checkout. */
export function PayWithStripeButton({
  depositRequestId,
  paymentId,
  kind = "DEPOSIT",
  label = "Pay with card (Stripe)",
  className = btnPrimary,
}: {
  depositRequestId?: string;
  paymentId?: string;
  kind?: "DEPOSIT" | "FULL";
  label?: string;
  className?: string;
}) {
  return (
    <form action={payWithStripe}>
      {depositRequestId ? (
        <input type="hidden" name="depositRequestId" value={depositRequestId} />
      ) : null}
      {paymentId ? (
        <input type="hidden" name="paymentId" value={paymentId} />
      ) : null}
      <input type="hidden" name="kind" value={kind} />
      <button type="submit" className={className}>
        <SubmitLabel label={label} />
      </button>
    </form>
  );
}
