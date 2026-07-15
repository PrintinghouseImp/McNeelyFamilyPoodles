import Link from "next/link";
import { createShopItem } from "@/app/admin/actions/cms";
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

export const metadata = { title: "Admin · New shop item" };

export default async function NewShopItemPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/shop" className="text-sm text-gray-500 hover:text-black">
        ← Shop
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black">
        New shop item
      </h1>
      <form
        action={createShopItem}
        encType="multipart/form-data"
        className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6"
      >
        <Field label="Title">
          <input name="title" required className={inputClass} />
        </Field>
        <Field label="Slug (optional)">
          <input name="slug" className={inputClass} />
        </Field>
        <Field label="Type">
          <select name="type" className={selectClass} defaultValue="AFFILIATE">
            <option value="AFFILIATE">Affiliate / sponsored link</option>
            <option value="PRODUCT">Product you sell</option>
          </select>
        </Field>
        <Field label="Link URL" hint="Amazon, your product page, etc.">
          <input name="url" type="url" className={inputClass} placeholder="https://" />
        </Field>
        <Field label="Price (USD)" hint="Optional">
          <input name="priceDollars" type="number" step="0.01" min="0" className={inputClass} />
        </Field>
        <Field label="Description">
          <textarea name="description" className={textareaClass} rows={4} />
        </Field>
        <Field label="Image">
          <input type="file" name="image" accept="image/*" className="block w-full text-sm" />
        </Field>
        <Field label="Sort order">
          <input name="sortOrder" type="number" defaultValue={0} className={inputClass} />
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="isPublished" defaultChecked className={checkClass} />
          Published on public site
        </label>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className={btnPrimary}>
            Create item
          </button>
          <Link href="/admin/shop" className={btnSecondary}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
