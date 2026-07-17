import Link from "next/link";
import { createParent } from "@/app/admin/actions/parents";
import {
  btnPrimary,
  btnSecondary,
  checkClass,
  inputClass,
  selectClass,
  textareaClass,
  Field,
} from "@/components/admin/field";
import { requireAdmin } from "@/lib/admin";

export const metadata = { title: "Admin · New parent" };

export default async function NewParentPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/parents"
        className="text-sm text-gray-500 hover:text-black"
      >
        ← All parents
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black">
        Add parent
      </h1>
      <form action={createParent} className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6">
        <Field label="Name">
          <input name="name" required className={inputClass} />
        </Field>
        <Field label="Slug (optional)" hint="Leave blank to auto-generate from name">
          <input name="slug" className={inputClass} placeholder="froggie" />
        </Field>
        <Field label="Sex">
          <select name="sex" required className={selectClass} defaultValue="FEMALE">
            <option value="FEMALE">Female (Dam)</option>
            <option value="MALE">Male (Sire)</option>
          </select>
        </Field>
        <Field label="Color">
          <input name="color" className={inputClass} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Weight (lbs)">
            <input name="weightLbs" type="number" step="0.1" className={inputClass} />
          </Field>
          <Field label='Height (inches)'>
            <input name="heightInches" type="number" step="0.1" className={inputClass} />
          </Field>
        </div>
        <Field label="Genetics">
          <input name="genetics" className={inputClass} />
        </Field>
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
          <input type="checkbox" name="isRetired" className={checkClass} />
          Retired — show on Alumni (removes from main Parents list)
        </label>
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" className={btnPrimary}>
            Create parent
          </button>
          <Link href="/admin/parents" className={btnSecondary}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
