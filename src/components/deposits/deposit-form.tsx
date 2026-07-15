"use client";

import { useActionState } from "react";
import {
  submitDepositRequest,
  type DepositFormState,
} from "@/app/actions/deposits";
import {
  btnPrimary,
  inputClass,
  selectClass,
  textareaClass,
  Field,
} from "@/components/admin/field";
import type { PaymentHandles } from "@/lib/settings";

const initial: DepositFormState = {};

type PuppyOption = { id: string; name: string; status: string };

export function DepositForm({
  puppies,
  handles,
  defaultPuppyId,
  defaultName,
  defaultEmail,
}: {
  puppies: PuppyOption[];
  handles: PaymentHandles;
  defaultPuppyId?: string;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [state, action, pending] = useActionState(submitDepositRequest, initial);

  return (
    <form action={action} className="space-y-5">
      {state.error ? (
        <p
          className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <Field label="Your name">
        <input
          name="name"
          required
          minLength={2}
          defaultValue={defaultName ?? ""}
          className={inputClass}
          autoComplete="name"
        />
      </Field>

      <Field label="Email">
        <input
          name="email"
          type="email"
          required
          defaultValue={defaultEmail ?? ""}
          className={inputClass}
          autoComplete="email"
        />
      </Field>

      <Field label="Phone" hint="Optional">
        <input name="phone" type="tel" className={inputClass} autoComplete="tel" />
      </Field>

      <Field label="Puppy" hint="Optional if you have not chosen one yet">
        <select
          name="puppyId"
          className={selectClass}
          defaultValue={defaultPuppyId ?? ""}
        >
          <option value="">No specific puppy</option>
          {puppies.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.status}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Payment method">
        <select name="method" required className={selectClass} defaultValue="VENMO">
          <option value="VENMO">
            Venmo{handles.venmo ? ` (${handles.venmo})` : ""}
          </option>
          <option value="ZELLE">
            Zelle{handles.zelle ? ` (${handles.zelle})` : ""}
          </option>
          <option value="PAYPAL">
            PayPal{handles.paypal ? ` (${handles.paypal})` : ""}
          </option>
        </select>
      </Field>

      <Field
        label="Deposit amount (USD)"
        hint="Optional — leave blank if you will confirm amount with the breeder"
      >
        <input
          name="amountDollars"
          type="number"
          min="0"
          step="0.01"
          className={inputClass}
          placeholder="500"
        />
      </Field>

      <Field label="Note to breeder" hint="Optional">
        <textarea
          name="customerNote"
          className={textareaClass}
          rows={4}
          placeholder="Which puppy, preferred pick-up week, etc."
        />
      </Field>

      <button type="submit" className={btnPrimary} disabled={pending}>
        {pending ? "Submitting…" : "Submit deposit request"}
      </button>
    </form>
  );
}
