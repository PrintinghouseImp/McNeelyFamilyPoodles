import Link from "next/link";
import { createLitter } from "@/app/admin/actions/litters";
import {
  btnSecondary,
  checkClass,
  inputClass,
  selectClass,
  textareaClass,
  Field } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export const metadata = { title: "Admin · New litter" };

export default async function NewLitterPage() {
  await requireAdmin();

  const parents = await db.parentDog.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, sex: true } });
  const dams = parents.filter((p) => p.sex === "FEMALE");
  const sires = parents.filter((p) => p.sex === "MALE");

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/litters"
        className="text-sm text-gray-500 hover:text-black"
      >
        ← All litters
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black">
        Add litter
      </h1>

      {dams.length === 0 || sires.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">
          You need at least one published dam and one sire.{" "}
          <Link href="/admin/parents/new" className="underline">
            Add a parent
          </Link>{" "}
          first.
        </p>
      ) : (
        <form
          action={createLitter}
          className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6"
        >
          <Field label="Display name" hint='e.g. "Froggie × Arsibalt"'>
            <input name="name" className={inputClass} />
          </Field>
          <Field label="Slug (optional)">
            <input name="slug" className={inputClass} />
          </Field>
          <Field label="Birth date">
            <input name="birthDate" type="date" required className={inputClass} />
          </Field>
          <Field label="Dam">
            <select name="damId" required className={selectClass} defaultValue="">
              <option value="" disabled>
                Select dam
              </option>
              {dams.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Sire">
            <select name="sireId" required className={selectClass} defaultValue="">
              <option value="" disabled>
                Select sire
              </option>
              {sires.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Notes">
            <textarea name="notes" className={textareaClass} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked
              className={checkClass}
            />
            Published on public site
          </label>
          <div className="flex flex-wrap gap-3 pt-2">
            <SubmitButton pendingLabel="Creating…">Create litter</SubmitButton>
            <Link href="/admin/litters" className={btnSecondary}>
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
