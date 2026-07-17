import Link from "next/link";
import { createForeverHome } from "@/app/admin/actions/cms";
import {
  btnSecondary,
  checkClass,
  inputClass,
  textareaClass,
  Field } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { requireAdmin } from "@/lib/admin";

export const metadata = { title: "Admin · New forever home" };

export default async function NewForeverHomePage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/forever-homes"
        className="text-sm text-gray-500 hover:text-black"
      >
        ← Forever Homes
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black">
        New forever-home story
      </h1>
      <form
        action={createForeverHome}
        encType="multipart/form-data"
        className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6"
      >
        <Field label="Dog name">
          <input name="dogName" required className={inputClass} />
        </Field>
        <Field label="Family name">
          <input
            name="familyName"
            className={inputClass}
            placeholder="The Rivera Family"
          />
        </Field>
        <Field label="Testimonial quote">
          <textarea name="quote" required className={textareaClass} rows={4} />
        </Field>
        <Field label="Location">
          <input name="location" className={inputClass} placeholder="Phoenix, AZ" />
        </Field>
        <Field label="Placed date">
          <input name="placedAt" type="date" className={inputClass} />
        </Field>
        <Field label="Photo">
          <input type="file" name="photo" accept="image/*" className="block w-full text-sm" />
        </Field>
        <Field label="Or photo URL">
          <input name="photoUrl" className={inputClass} />
        </Field>
        <Field label="Sort order">
          <input name="sortOrder" type="number" defaultValue={0} className={inputClass} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="isPublished" defaultChecked className={checkClass} />
          Published on public site
        </label>
        <div className="flex flex-wrap gap-3">
          <SubmitButton pendingLabel="Creating…">Create story</SubmitButton>
          <Link href="/admin/forever-homes" className={btnSecondary}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
