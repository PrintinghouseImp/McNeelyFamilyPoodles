import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteForeverHome, updateForeverHome } from "@/app/admin/actions/cms";
import {
  btnDanger,
  btnPrimary,
  btnSecondary,
  checkClass,
  inputClass,
  textareaClass,
  Field,
} from "@/components/admin/field";
import { PhotoFrame } from "@/components/inventory/photo-frame";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export default async function EditForeverHomePage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const story = await db.foreverHome.findUnique({ where: { id } });
  if (!story) notFound();

  const placedValue = story.placedAt
    ? story.placedAt.toISOString().slice(0, 10)
    : "";

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/forever-homes"
        className="text-sm text-gray-500 hover:text-black"
      >
        ← Forever Homes
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black">
        {story.dogName}
      </h1>

      {story.photoUrl ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
          <PhotoFrame src={story.photoUrl} alt={story.dogName} />
        </div>
      ) : null}

      <form
        action={updateForeverHome}
        encType="multipart/form-data"
        className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6"
      >
        <input type="hidden" name="id" value={story.id} />
        <Field label="Dog name">
          <input
            name="dogName"
            required
            defaultValue={story.dogName}
            className={inputClass}
          />
        </Field>
        <Field label="Family name">
          <input
            name="familyName"
            defaultValue={story.familyName ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Testimonial quote">
          <textarea
            name="quote"
            required
            defaultValue={story.quote}
            className={textareaClass}
            rows={4}
          />
        </Field>
        <Field label="Location">
          <input
            name="location"
            defaultValue={story.location ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Placed date">
          <input
            name="placedAt"
            type="date"
            defaultValue={placedValue}
            className={inputClass}
          />
        </Field>
        <Field label="Replace photo">
          <input type="file" name="photo" accept="image/*" className="block w-full text-sm" />
        </Field>
        <Field label="Or photo URL">
          <input
            name="photoUrl"
            defaultValue={story.photoUrl ?? ""}
            className={inputClass}
          />
        </Field>
        {story.photoUrl ? (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="remove_photo" value="1" className={checkClass} />
            Remove photo
          </label>
        ) : null}
        <Field label="Sort order">
          <input
            name="sortOrder"
            type="number"
            defaultValue={story.sortOrder}
            className={inputClass}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={story.isPublished}
            className={checkClass}
          />
          Published on public site
        </label>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className={btnPrimary}>
            Save
          </button>
          <Link href="/admin/forever-homes" className={btnSecondary}>
            Cancel
          </Link>
        </div>
      </form>

      <form
        action={deleteForeverHome}
        className="mt-10 rounded-2xl border border-red-100 bg-white p-6"
      >
        <input type="hidden" name="id" value={story.id} />
        <button type="submit" className={btnDanger}>
          Delete story
        </button>
      </form>
    </div>
  );
}
