import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteArticle, updateArticle } from "@/app/admin/actions/cms";
import {
  btnDanger,
  btnSecondary,
  checkClass,
  inputClass,
  textareaClass,
  Field } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { PhotoFrame } from "@/components/inventory/photo-frame";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export default async function EditArticlePage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const article = await db.article.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/articles" className="text-sm text-gray-500 hover:text-black">
        ← Articles
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black">
        {article.title}
      </h1>
      {article.isPublished ? (
        <p className="mt-1 text-sm text-gray-500">
          Public:{" "}
          <Link href={`/articles/${article.slug}`} className="hover:underline">
            /articles/{article.slug}
          </Link>
        </p>
      ) : (
        <p className="mt-1 text-sm text-gray-500">Draft — not on public site</p>
      )}

      {article.coverUrl ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
          <PhotoFrame src={article.coverUrl} alt={article.title} />
        </div>
      ) : null}

      <form
        action={updateArticle}
        encType="multipart/form-data"
        className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6"
      >
        <input type="hidden" name="id" value={article.id} />
        <Field label="Title">
          <input name="title" required defaultValue={article.title} className={inputClass} />
        </Field>
        <Field label="Slug">
          <input name="slug" required defaultValue={article.slug} className={inputClass} />
        </Field>
        <Field label="Excerpt">
          <textarea
            name="excerpt"
            defaultValue={article.excerpt ?? ""}
            className={textareaClass}
            rows={2}
          />
        </Field>
        <Field label="Content">
          <textarea
            name="content"
            required
            defaultValue={article.content}
            className={textareaClass}
            rows={12}
          />
        </Field>
        <Field label="Replace cover image">
          <input type="file" name="cover" accept="image/*" className="block w-full text-sm" />
        </Field>
        <Field label="Or cover image URL">
          <input
            name="coverUrl"
            defaultValue={article.coverUrl ?? ""}
            className={inputClass}
          />
        </Field>
        {article.coverUrl ? (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="remove_cover" value="1" className={checkClass} />
            Remove cover image
          </label>
        ) : null}
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={article.isPublished}
            className={checkClass}
          />
          Published on public site
        </label>
        <div className="flex flex-wrap gap-3">
          <SubmitButton>Save</SubmitButton>
          <Link href="/admin/articles" className={btnSecondary}>
            Cancel
          </Link>
        </div>
      </form>

      <form action={deleteArticle} className="mt-10 rounded-2xl border border-red-100 bg-white p-6">
        <input type="hidden" name="id" value={article.id} />
        <button type="submit" className={btnDanger}>
          Delete article
        </button>
      </form>
    </div>
  );
}
