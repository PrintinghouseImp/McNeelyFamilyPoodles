"use client";

import { useActionState } from "react";
import {
  submitApplication,
  type ApplicationFormState,
} from "@/app/actions/applications";
import {
  btnPrimary,
  checkClass,
  inputClass,
  selectClass,
  textareaClass,
  Field,
} from "@/components/admin/field";

const initial: ApplicationFormState = {};

type PuppyOption = { id: string; name: string; status: string };

export function ApplicationForm({
  puppies,
  defaultPuppyId,
  defaultName,
  defaultEmail,
}: {
  puppies: PuppyOption[];
  defaultPuppyId?: string;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [state, action, pending] = useActionState(submitApplication, initial);

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

      <Field label="Your name">
        <input
          name="name"
          required
          minLength={2}
          defaultValue={defaultName ?? ""}
          className={inputClass}
          autoComplete="name"
        />
        {state.fieldErrors?.name ? (
          <span className="mt-1 block text-xs text-red-600">
            {state.fieldErrors.name[0]}
          </span>
        ) : null}
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
        {state.fieldErrors?.email ? (
          <span className="mt-1 block text-xs text-red-600">
            {state.fieldErrors.email[0]}
          </span>
        ) : null}
      </Field>

      <Field label="Phone" hint="Optional">
        <input
          name="phone"
          type="tel"
          className={inputClass}
          autoComplete="tel"
        />
      </Field>

      <Field
        label="Puppy"
        hint="Optional — leave as general if you are open to a match"
      >
        <select
          name="puppyId"
          className={selectClass}
          defaultValue={defaultPuppyId ?? ""}
        >
          <option value="">General application (no specific puppy)</option>
          {puppies.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.status}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Home type" hint="House, apartment, etc.">
        <input name="homeType" className={inputClass} placeholder="House with yard" />
      </Field>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="hasKids" className={checkClass} />
          Children in the home
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="hasPets" className={checkClass} />
          Other pets in the home
        </label>
      </div>

      <Field label="Message" hint="Tell us about your household and what you are looking for">
        <textarea
          name="message"
          className={textareaClass}
          rows={5}
          placeholder="Experience with dogs, schedule, preferences…"
        />
      </Field>

      <button type="submit" className={btnPrimary} disabled={pending}>
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
