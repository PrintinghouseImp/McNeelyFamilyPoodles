import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteSocialPost, updateSocialPost } from "@/app/admin/actions/cms";
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

export default async function EditSocialPostPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const post = await db.socialPost.findUnique({ where: { id } });
  if (!post) notFound();

  const postedValue = post.postedAt
    ? post.postedAt.toISOString().slice(0, 10)
    : "";

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/social" className="text-sm text-gray-500 hover:text-black">
        ← Social
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black">
        Edit curated post
      </h1>

      {post.imageUrl ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
          <PhotoFrame src={post.imageUrl} alt={post.caption ?? "Social post"} />
        </div>
      ) : null}

      <form
        action={updateSocialPost}
        encType="multipart/form-data"
        className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6"
      >
        <input type="hidden" name="id" value={post.id} />
        <Field label="Platform">
          <input name="platform" defaultValue={post.platform} className={inputClass} />
        </Field>
        <Field label="Post URL">
          <input
            name="postUrl"
            type="url"
            required
            defaultValue={post.postUrl}
            className={inputClass}
          />
        </Field>
        <Field label="Caption">
          <textarea
            name="caption"
            defaultValue={post.caption ?? ""}
            className={textareaClass}
            rows={3}
          />
        </Field>
        <Field label="Replace thumbnail">
          <input type="file" name="image" accept="image/*" className="block w-full text-sm" />
        </Field>
        <Field label="Or image URL">
          <input
            name="imageUrl"
            defaultValue={post.imageUrl ?? ""}
            className={inputClass}
          />
        </Field>
        {post.imageUrl ? (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="remove_image" value="1" className={checkClass} />
            Remove image
          </label>
        ) : null}
        <Field label="Posted date">
          <input
            name="postedAt"
            type="date"
            defaultValue={postedValue}
            className={inputClass}
          />
        </Field>
        <Field label="Sort order">
          <input
            name="sortOrder"
            type="number"
            defaultValue={post.sortOrder}
            className={inputClass}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={post.isPublished}
            className={checkClass}
          />
          Published
        </label>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className={btnPrimary}>
            Save
          </button>
          <Link href="/admin/social" className={btnSecondary}>
            Cancel
          </Link>
        </div>
      </form>

      <form action={deleteSocialPost} className="mt-10 rounded-2xl border border-red-100 bg-white p-6">
        <input type="hidden" name="id" value={post.id} />
        <button type="submit" className={btnDanger}>
          Delete post
        </button>
      </form>
    </div>
  );
}
