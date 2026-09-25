import Link from "next/link";
import { createPuppy } from "@/app/admin/actions/puppies";
import {
  btnSecondary,
  checkClass,
  inputClass,
  selectClass,
  textareaClass,
  Field } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { LitterParentFields } from "@/components/admin/litter-parent-fields";
import { requireAdmin } from "@/lib/admin";
import { formatPuppyStatus, PUPPY_STATUSES } from "@/lib/format";
import { litterParentChoices } from "@/lib/litter-parents";

export const metadata = { title: "Admin · New puppy" };

export default async function NewPuppyPage() {
  await requireAdmin();

  const { dams, sires } = await litterParentChoices();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/puppies"
        className="text-sm text-gray-500 hover:text-black"
      >
        ← All puppies
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black">
        Add puppy
      </h1>
      <form
        action={createPuppy}
        className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6"
      >
        <Field label="Name" hint="URL slug is generated automatically from the name">
          <input name="name" required className={inputClass} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Sex">
            <select name="sex" required className={selectClass} defaultValue="FEMALE">
              <option value="FEMALE">Female</option>
              <option value="MALE">Male</option>
            </select>
          </Field>
          <Field label="Status">
            <select name="status" className={selectClass} defaultValue="AVAILABLE">
              {PUPPY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatPuppyStatus(status)}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Color">
          <input name="color" className={inputClass} />
        </Field>
        <Field label="Price (USD)" hint="e.g. 1200">
          <input name="priceDollars" type="number" step="0.01" min="0" className={inputClass} />
        </Field>
        <Field label="Birth date">
          <input name="birthDate" type="date" className={inputClass} />
        </Field>
        <LitterParentFields dams={dams} sires={sires} />
        <Field label="Description">
          <textarea name="description" className={textareaClass} />
        </Field>
        <Field label="Sort order">
          <input name="sortOrder" type="number" defaultValue={0} className={inputClass} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="isPublished" defaultChecked className={checkClass} />
          Published on public site
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="isAdopted" className={checkClass} />
          On Alumni (removes from the main Puppies list and sets status to Sold)
        </label>
        <div className="flex flex-wrap gap-3 pt-2">
          <SubmitButton pendingLabel="Creating…">Create puppy</SubmitButton>
          <Link href="/admin/puppies" className={btnSecondary}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
