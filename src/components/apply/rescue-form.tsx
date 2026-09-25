"use client";

import { useActionState } from "react";
import {
  submitRescueApplication,
  type RescueFormState,
} from "@/app/actions/rescue";
import {
  btnPrimary,
  checkClass,
  inputClass,
  textareaClass,
  Field,
} from "@/components/admin/field";

const initial: RescueFormState = {};

export function RescueForm() {
  const [state, action, pending] = useActionState(
    submitRescueApplication,
    initial,
  );

  return (
    <form action={action} className="mx-auto max-w-xl space-y-5 text-left">
      {state.error ? (
        <p
          className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <Field label="Organization name">
        <input name="organizationName" required className={inputClass} />
      </Field>
      <Field label="Website">
        <input
          name="website"
          required
          className={inputClass}
          placeholder="https://"
        />
      </Field>
      <Field label="EIN">
        <input name="ein" required className={inputClass} autoComplete="off" />
      </Field>
      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="confirms501c3"
          required
          className={`${checkClass} mt-0.5`}
        />
        <span>This organization is a verified 501(c)(3).</span>
      </label>
      <Field label="Focus">
        <textarea name="focus" required className={textareaClass} rows={4} />
      </Field>
      <Field label="Contact name">
        <input name="contactName" required className={inputClass} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required className={inputClass} />
      </Field>
      <Field label="Phone">
        <input name="phone" type="tel" className={inputClass} />
      </Field>
      <button type="submit" className={btnPrimary} disabled={pending}>
        {pending ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
