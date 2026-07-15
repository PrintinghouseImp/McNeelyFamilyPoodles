import Link from "next/link";
import { createArticle } from "@/app/admin/actions/cms";
import {
  btnPrimary,
  btnSecondary,
  checkClass,
  inputClass,
  textareaClass,
  Field,
} from "@/components/admin/field";
import { requireAdmin } from "@/lib/admin";

export const metadata = { title: "Admin · New article" };

export default async function NewArticlePage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/articles" className="text-sm text-gray-500 hover:text-black">
        ← Articles
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black">
        New article
      </h1>
      <form
        action={createArticle}
        encType="multipart/form-data"
        className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6"
      >
        <Field label="Title">
          <input name="title" required className={inputClass} />
        </Field>
        <Field label="Slug (optional)">
          <input name="slug" className={inputClass} placeholder="auto-from-title" />
        </Field>
        <Field label="Excerpt" hint="Short blurb for the card list">
          <textarea name="excerpt" className={textareaClass} rows={2} />
        </Field>
        <Field label="Content" hint="Plain text or simple paragraphs">
          <textarea name="content" required className={textareaClass} rows={12} />
        </Field>
        <Field label="Cover image" hint="Optional photo for the card">
          <input
            type="file"
            name="cover"
            accept="image/*"
            className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium"
          />
        </Field>
        <Field label="Or cover image URL">
          <input name="coverUrl" className={inputClass} placeholder="https://…" />
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="isPublished" className={checkClass} />
          Published on public site
        </label>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className={btnPrimary}>
            Create article
          </button>
          <Link href="/admin/articles" className={btnSecondary}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
