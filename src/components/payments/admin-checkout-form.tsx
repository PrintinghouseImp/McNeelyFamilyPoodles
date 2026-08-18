"use client";

import { useActionState } from "react";
import {
  createAdminCheckoutSession,
  type AdminPaymentFormState,
} from "@/app/admin/actions/payments";
import {
  btnPrimary,
  btnSecondary,
  inputClass,
  selectClass,
  textareaClass,
  Field,
} from "@/components/admin/field";

const initial: AdminPaymentFormState = {};

type PuppyOption = { id: string; name: string; priceLabel: string };
type CustomerOption = { id: string; email: string; name: string | null };

export function AdminCheckoutForm({
  puppies,
  customers,
  defaultKind = "FULL",
  defaultPuppyId,
  defaultEmail,
  defaultName,
  defaultAmountDollars,
  defaultDepositRequestId,
  emailConfigured = false,
}: {
  puppies: PuppyOption[];
  customers: CustomerOption[];
  defaultKind?: "DEPOSIT" | "FULL";
  defaultPuppyId?: string;
  defaultEmail?: string;
  defaultName?: string;
  defaultAmountDollars?: string;
  defaultDepositRequestId?: string;
  emailConfigured?: boolean;
}) {
  const [state, action, pending] = useActionState(
    createAdminCheckoutSession,
    initial,
  );

  return (
    <form action={action} className="space-y-5">
      {defaultDepositRequestId ? (
        <input
          type="hidden"
          name="depositRequestId"
          value={defaultDepositRequestId}
        />
      ) : null}

      {state.error ? (
        <p
          className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      {state.checkoutUrl ? (
        <div
          className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-3 text-sm text-emerald-900"
          role="status"
        >
          <p className="font-medium">Checkout link ready</p>
          {state.emailMessage ? (
            <p
              className={`mt-1 text-sm ${
                state.emailSent ? "text-emerald-900" : "text-amber-900"
              }`}
            >
              {state.emailSent ? "✓ " : "⚠ "}
              {state.emailMessage}
            </p>
          ) : null}
          <p className="mt-2 break-all text-xs">{state.checkoutUrl}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={state.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={btnPrimary}
            >
              Open Stripe Checkout
            </a>
            <button
              type="button"
              className={btnSecondary}
              onClick={() => {
                void navigator.clipboard.writeText(state.checkoutUrl!);
              }}
            >
              Copy link
            </button>
          </div>
          {state.paymentId ? (
            <p className="mt-2 text-xs text-emerald-800/80">
              Payment id: {state.paymentId}
              {" · "}
              Visible in the customer portal when they sign in with the same
              email (or when a portal user is selected).
            </p>
          ) : null}
        </div>
      ) : null}

      <Field label="Payment type">
        <select
          name="kind"
          className={selectClass}
          defaultValue={defaultKind}
          required
        >
          <option value="DEPOSIT">Deposit (reservation)</option>
          <option value="FULL">Full sale payment</option>
        </select>
      </Field>

      <Field
        label="Amount (USD)"
        hint="For full sales, leave blank to use the puppy list price when set"
      >
        <input
          name="amountDollars"
          type="number"
          min="0.5"
          step="0.01"
          className={inputClass}
          defaultValue={defaultAmountDollars ?? ""}
          placeholder="500.00"
        />
      </Field>

      <Field label="Puppy" hint="Optional">
        <select
          name="puppyId"
          className={selectClass}
          defaultValue={defaultPuppyId ?? ""}
        >
          <option value="">No specific puppy</option>
          {puppies.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.priceLabel ? ` · ${p.priceLabel}` : ""}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Link to customer account"
        hint="Optional — auto-matched by email if they already have a portal login"
      >
        <select name="userId" className={selectClass} defaultValue="">
          <option value="">Auto-match by email (recommended)</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.email}
              {c.name ? ` · ${c.name}` : ""}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Customer email">
        <input
          name="customerEmail"
          type="email"
          className={inputClass}
          defaultValue={defaultEmail ?? ""}
          placeholder="buyer@example.com"
          required
        />
      </Field>

      <Field label="Customer name" hint="Optional">
        <input
          name="customerName"
          className={inputClass}
          defaultValue={defaultName ?? ""}
        />
      </Field>

      <Field label="Description" hint="Optional — shown on Stripe receipt">
        <textarea
          name="description"
          className={textareaClass}
          rows={2}
          placeholder="e.g. Deposit for Pepper · McNeely Family Poodles"
        />
      </Field>

      <div className="space-y-2">
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="sendEmail"
            value="1"
            defaultChecked
            className="mt-0.5 h-4 w-4 rounded border-gray-300"
          />
          <span>
            <span className="font-medium text-black">
              Email checkout link to customer
            </span>
            <span className="mt-0.5 block text-xs text-gray-500">
              {emailConfigured
                ? "Uses Resend (RESEND_API_KEY). Customer also sees the link in /portal when signed in."
                : "Set RESEND_API_KEY + EMAIL_FROM in .env to send email. Link still works if you copy it."}
            </span>
          </span>
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="redirectToStripe"
            value="1"
            className="h-4 w-4 rounded border-gray-300"
          />
          Open Stripe Checkout immediately after creating
        </label>
      </div>

      <button type="submit" className={btnPrimary} disabled={pending}>
        {pending ? "Creating…" : "Generate link & notify customer"}
      </button>
    </form>
  );
}
