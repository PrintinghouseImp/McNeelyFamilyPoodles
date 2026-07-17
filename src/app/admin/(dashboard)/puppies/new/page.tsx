import Link from "next/link";
import { createPuppy } from "@/app/admin/actions/puppies";
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
import { db } from "@/lib/db";

export const metadata = { title: "Admin · New puppy" };

export default async function NewPuppyPage() {
  await requireAdmin();

  const litters = await db.litter.findMany({
    orderBy: { birthDate: "desc" },
    select: { id: true, name: true, slug: true },
  });

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
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
              <option value="GUARDIANSHIP">Guardianship</option>
              <option value="UNAVAILABLE">Unavailable</option>
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
        <Field label="Litter">
          <select name="litterId" className={selectClass} defaultValue="">
            <option value="">No litter</option>
            {litters.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name ?? l.slug}
              </option>
            ))}
          </select>
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
          <input type="checkbox" name="isAdopted" className={checkClass} />
          Adopted — show on Alumni (removes from main Puppies list)
        </label>
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" className={btnPrimary}>
            Create puppy
          </button>
          <Link href="/admin/puppies" className={btnSecondary}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
