import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteParent, updateParent } from "@/app/admin/actions/parents";
import { PhotoManager } from "@/components/admin/photo-manager";
import {
  btnDanger,
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

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const parent = await db.parentDog.findUnique({ where: { id } });
  return { title: parent ? `Admin · ${parent.name}` : "Admin · Parent" };
}

export default async function EditParentPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const parent = await db.parentDog.findUnique({
    where: { id },
    include: {
      photos: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
      medicalRecords: {
        orderBy: [{ recordDate: "desc" }, { createdAt: "desc" }],
        select: { id: true, title: true, recordDate: true, fileUrl: true },
      },
    },
  });
  if (!parent) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/parents"
        className="text-sm text-gray-500 hover:text-black"
      >
        ← All parents
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            {parent.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Public:{" "}
            <Link
              href={`/parents/${parent.slug}`}
              className="underline-offset-2 hover:underline"
            >
              /parents/{parent.slug}
            </Link>
          </p>
        </div>
      </div>

      <form
        action={updateParent}
        className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6"
      >
        <input type="hidden" name="id" value={parent.id} />
        <Field label="Name">
          <input name="name" required defaultValue={parent.name} className={inputClass} />
        </Field>
        <Field label="Slug">
          <input name="slug" required defaultValue={parent.slug} className={inputClass} />
        </Field>
        <Field label="Sex">
          <select name="sex" required className={selectClass} defaultValue={parent.sex}>
            <option value="FEMALE">Female (Dam)</option>
            <option value="MALE">Male (Sire)</option>
          </select>
        </Field>
        <Field label="Color">
          <input name="color" defaultValue={parent.color ?? ""} className={inputClass} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Weight (lbs)">
            <input
              name="weightLbs"
              type="number"
              step="0.1"
              defaultValue={parent.weightLbs ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label='Height (inches)'>
            <input
              name="heightInches"
              type="number"
              step="0.1"
              defaultValue={parent.heightInches ?? ""}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Genetics">
          <input name="genetics" defaultValue={parent.genetics ?? ""} className={inputClass} />
        </Field>
        <Field label="Description">
          <textarea
            name="description"
            defaultValue={parent.description ?? ""}
            className={textareaClass}
          />
        </Field>
        <Field label="Sort order">
          <input
            name="sortOrder"
            type="number"
            defaultValue={parent.sortOrder}
            className={inputClass}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={parent.isPublished}
            className={checkClass}
          />
          Published on public site
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="isRetired"
            defaultChecked={parent.isRetired}
            className={checkClass}
          />
          Retired
        </label>
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" className={btnPrimary}>
            Save changes
          </button>
          <Link href="/admin/parents" className={btnSecondary}>
            Cancel
          </Link>
        </div>
      </form>

      <PhotoManager
        entityType="PARENT"
        entityId={parent.id}
        photos={parent.photos}
      />

      <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-black">Medical records</h2>
            <p className="mt-1 text-sm text-gray-500">
              Admin-only PDFs and scans with clear titles/labels.
            </p>
          </div>
          <Link
            href={`/admin/medical/new?parent=${parent.id}`}
            className={btnPrimary}
          >
            Add record
          </Link>
        </div>
        {parent.medicalRecords.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No medical records yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100">
            {parent.medicalRecords.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <div>
                  <Link
                    href={`/admin/medical/${r.id}`}
                    className="font-medium text-black hover:underline"
                  >
                    {r.title}
                  </Link>
                  <p className="text-xs text-gray-400">
                    {r.fileUrl ? "File attached" : "No file"}
                  </p>
                </div>
                <Link
                  href={`/admin/medical/${r.id}`}
                  className={btnSecondary}
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/admin/medical?parent=${parent.id}`}
          className="mt-4 inline-block text-sm text-gray-500 hover:text-black"
        >
          View all for this dog →
        </Link>
      </section>

      <form action={deleteParent} className="mt-10 rounded-2xl border border-red-100 bg-white p-6">
        <input type="hidden" name="id" value={parent.id} />
        <h2 className="text-sm font-semibold text-red-800">Danger zone</h2>
        <p className="mt-1 text-sm text-gray-500">
          Deletes this parent. Blocked if they are linked to any litter.
        </p>
        <button type="submit" className={`${btnDanger} mt-4`}>
          Delete parent
        </button>
      </form>
    </div>
  );
}
