import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteLitter, updateLitter } from "@/app/admin/actions/litters";
import { PhotoManager } from "@/components/admin/photo-manager";
import {
  btnDanger,
  btnSecondary,
  checkClass,
  inputClass,
  selectClass,
  textareaClass,
  Field } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const litter = await db.litter.findUnique({ where: { id } });
  return {
    title: litter
      ? `Admin · ${litter.name ?? litter.slug}`
      : "Admin · Litter" };
}

export default async function EditLitterPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const [litter, parents] = await Promise.all([
    db.litter.findUnique({
      where: { id },
      include: {
        photos: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
        puppies: { select: { id: true, name: true, slug: true } } } }),
    db.parentDog.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, sex: true } }),
  ]);
  if (!litter) notFound();

  const dams = parents.filter((p) => p.sex === "FEMALE");
  const sires = parents.filter((p) => p.sex === "MALE");
  const birthValue = litter.birthDate.toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/litters"
        className="text-sm text-gray-500 hover:text-black"
      >
        ← All litters
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black">
        {litter.name ?? litter.slug}
      </h1>

      <form
        action={updateLitter}
        className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6"
      >
        <input type="hidden" name="id" value={litter.id} />
        <Field label="Display name">
          <input
            name="name"
            defaultValue={litter.name ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Slug">
          <input
            name="slug"
            required
            defaultValue={litter.slug}
            className={inputClass}
          />
        </Field>
        <Field label="Birth date">
          <input
            name="birthDate"
            type="date"
            required
            defaultValue={birthValue}
            className={inputClass}
          />
        </Field>
        <Field label="Dam">
          <select name="damId" required className={selectClass} defaultValue={litter.damId}>
            {dams.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Sire">
          <select name="sireId" required className={selectClass} defaultValue={litter.sireId}>
            {sires.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Notes">
          <textarea
            name="notes"
            defaultValue={litter.notes ?? ""}
            className={textareaClass}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={litter.isPublished}
            className={checkClass}
          />
          Published on public site
        </label>
        <div className="flex flex-wrap gap-3 pt-2">
          <SubmitButton>Save changes</SubmitButton>
          <Link href="/admin/litters" className={btnSecondary}>
            Cancel
          </Link>
        </div>
      </form>

      {litter.puppies.length > 0 ? (
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-black">Puppies in litter</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {litter.puppies.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/puppies/${p.id}`}
                  className="text-gray-700 hover:text-black hover:underline"
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <PhotoManager
        entityType="LITTER"
        entityId={litter.id}
        photos={litter.photos}
      />

      <form
        action={deleteLitter}
        className="mt-10 rounded-2xl border border-red-100 bg-white p-6"
      >
        <input type="hidden" name="id" value={litter.id} />
        <h2 className="text-sm font-semibold text-red-800">Danger zone</h2>
        <p className="mt-1 text-sm text-gray-500">
          Deletes this litter. Puppies will be unlinked (not deleted).
        </p>
        <button type="submit" className={`${btnDanger} mt-4`}>
          Delete litter
        </button>
      </form>
    </div>
  );
}
