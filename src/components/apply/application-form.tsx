"use client";

import { useActionState, useState } from "react";
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
  intent = "PUPPY",
}: {
  puppies: PuppyOption[];
  defaultPuppyId?: string;
  defaultName?: string;
  defaultEmail?: string;
  intent?: "PUPPY" | "GUARDIAN";
}) {
  const [state, action, pending] = useActionState(submitApplication, initial);
  const [firstPuppy, setFirstPuppy] = useState(defaultPuppyId ?? "");
  const [secondPuppy, setSecondPuppy] = useState("");

  return (
    <form action={action} className="mx-auto max-w-xl space-y-5 text-left">
      <input type="hidden" name="intent" value={intent} />
      {intent === "GUARDIAN" ? (
        <p className="text-sm text-gray-600">
          This application will be marked as a guardian request.
        </p>
      ) : null}
      <div>
        <h2 className="text-lg font-semibold text-black">Tell us about you</h2>
        <p className="mt-1 text-sm text-gray-500">
          (this helps us match you with the best companion for your home)
        </p>
      </div>
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
        label="First puppy"
        hint="Optional. Leave blank for a general waitlist."
      >
        <select
          name="puppyId"
          className={selectClass}
          value={firstPuppy}
          onChange={(event) => setFirstPuppy(event.target.value)}
        >
          <option value="">No specific puppy</option>
          {puppies
            .filter((p) => p.id !== secondPuppy)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.status}
              </option>
            ))}
        </select>
      </Field>

      <Field label="Second puppy" hint="Optional. Up to two published puppies.">
        <select
          name="secondPuppyId"
          className={selectClass}
          value={secondPuppy}
          onChange={(event) => setSecondPuppy(event.target.value)}
        >
          <option value="">None</option>
          {puppies
            .filter((p) => p.id !== firstPuppy)
            .map((p) => (
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

      <p className="text-sm text-gray-500">
        Puppies are sold on a first come first serve basis. Placing a deposit
        ensures that your dog will be reserved for you for up to 30 days
        (unless otherwise specified in official correspondence). The deposit is
        non-refundable, and will be applied to the purchase price of your puppy
        at take-home day.
      </p>

      <button type="submit" className={btnPrimary} disabled={pending}>
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
