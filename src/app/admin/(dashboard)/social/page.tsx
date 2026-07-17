import Link from "next/link";
import {
  createSocialPost,
  updateSocialSettings,
} from "@/app/admin/actions/cms";
import {
  btnSecondary,
  checkClass,
  inputClass,
  textareaClass,
  Field,
} from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Admin · Social" };

type Props = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminSocialPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;

  const [settings, posts] = await Promise.all([
    db.siteSetting.findMany({
      where: { key: { in: ["instagram_url", "facebook_url"] } },
    }),
    db.socialPost.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ]);
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-black">
        Social
      </h1>
      <p className="mt-1 text-gray-500">
        Profile links and curated posts for the public Social page (no live Meta
        API required).
      </p>

      {params.saved === "1" ? (
        <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Profile links saved.
        </p>
      ) : null}

      <form
        action={updateSocialSettings}
        className="mt-8 max-w-xl space-y-4 rounded-2xl border border-gray-200 bg-white p-6"
      >
        <h2 className="text-lg font-semibold text-black">Profile links</h2>
        <Field label="Instagram URL">
          <input
            name="instagram_url"
            type="url"
            defaultValue={map.instagram_url ?? ""}
            className={inputClass}
            placeholder="https://instagram.com/yourhandle"
          />
        </Field>
        <Field label="Facebook URL">
          <input
            name="facebook_url"
            type="url"
            defaultValue={map.facebook_url ?? ""}
            className={inputClass}
            placeholder="https://facebook.com/yourpage"
          />
        </Field>
        <SubmitButton pendingLabel="Saving…">Save profile links</SubmitButton>
      </form>

      <div className="mt-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-black">Curated posts</h2>
        </div>

        <form
          action={createSocialPost}
          encType="multipart/form-data"
          className="mb-8 max-w-xl space-y-4 rounded-2xl border border-gray-200 bg-white p-6"
        >
          <h3 className="text-sm font-medium text-black">Add post</h3>
          <Field label="Platform">
            <input
              name="platform"
              defaultValue="Instagram"
              className={inputClass}
              placeholder="Instagram or Facebook"
            />
          </Field>
          <Field label="Post URL">
            <input name="postUrl" type="url" required className={inputClass} />
          </Field>
          <Field label="Caption">
            <textarea name="caption" className={textareaClass} rows={3} />
          </Field>
          <Field label="Thumbnail image">
            <input type="file" name="image" accept="image/*" className="block w-full text-sm" />
          </Field>
          <Field label="Or image URL">
            <input name="imageUrl" className={inputClass} />
          </Field>
          <Field label="Posted date">
            <input name="postedAt" type="date" className={inputClass} />
          </Field>
          <Field label="Sort order">
            <input name="sortOrder" type="number" defaultValue={0} className={inputClass} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="isPublished" defaultChecked className={checkClass} />
            Published
          </label>
          <SubmitButton pendingLabel="Adding…">Add curated post</SubmitButton>
        </form>

        {posts.length === 0 ? (
          <p className="text-gray-500">No curated posts yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
            {posts.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm"
              >
                <div>
                  <p className="font-medium text-black">
                    {p.platform}
                    {!p.isPublished ? (
                      <span className="ml-2 text-xs text-gray-400">Draft</span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-gray-500">
                    {p.caption ?? p.postUrl}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {formatDate(p.postedAt) ?? "No date"}
                  </p>
                </div>
                <Link href={`/admin/social/${p.id}`} className={btnSecondary}>
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
