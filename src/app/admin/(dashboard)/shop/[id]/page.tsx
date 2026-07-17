import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteShopItem, updateShopItem } from "@/app/admin/actions/cms";
import {
  btnDanger,
  btnSecondary,
  checkClass,
  inputClass,
  selectClass,
  textareaClass,
  Field } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { PhotoFrame } from "@/components/inventory/photo-frame";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

type Props = { params: Promise<{ id: string }> };

export default async function EditShopItemPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const item = await db.shopItem.findUnique({
    where: { id },
    include: {
      photos: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] } } });
  if (!item) notFound();

  const primary = item.photos.find((p) => p.isPrimary) ?? item.photos[0];
  const priceDollars =
    item.priceCents != null ? (item.priceCents / 100).toFixed(2) : "";

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/shop" className="text-sm text-gray-500 hover:text-black">
        ← Shop
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black">
        {item.title}
      </h1>

      {primary ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
          <PhotoFrame src={primary.url} alt={item.title} />
        </div>
      ) : null}

      <form
        action={updateShopItem}
        encType="multipart/form-data"
        className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6"
      >
        <input type="hidden" name="id" value={item.id} />
        <Field label="Title">
          <input name="title" required defaultValue={item.title} className={inputClass} />
        </Field>
        <Field label="Slug">
          <input name="slug" required defaultValue={item.slug} className={inputClass} />
        </Field>
        <Field label="Type">
          <select name="type" className={selectClass} defaultValue={item.type}>
            <option value="AFFILIATE">Affiliate / sponsored link</option>
            <option value="PRODUCT">Product you sell</option>
          </select>
        </Field>
        <Field label="Link URL">
          <input name="url" type="url" defaultValue={item.url ?? ""} className={inputClass} />
        </Field>
        <Field label="Price (USD)">
          <input
            name="priceDollars"
            type="number"
            step="0.01"
            min="0"
            defaultValue={priceDollars}
            className={inputClass}
          />
        </Field>
        <Field label="Description">
          <textarea
            name="description"
            defaultValue={item.description ?? ""}
            className={textareaClass}
            rows={4}
          />
        </Field>
        <Field label="Replace image">
          <input type="file" name="image" accept="image/*" className="block w-full text-sm" />
        </Field>
        <Field label="Sort order">
          <input
            name="sortOrder"
            type="number"
            defaultValue={item.sortOrder}
            className={inputClass}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={item.isPublished}
            className={checkClass}
          />
          Published on public site
        </label>
        <div className="flex flex-wrap gap-3">
          <SubmitButton>Save</SubmitButton>
          <Link href="/admin/shop" className={btnSecondary}>
            Cancel
          </Link>
        </div>
      </form>

      <form action={deleteShopItem} className="mt-10 rounded-2xl border border-red-100 bg-white p-6">
        <input type="hidden" name="id" value={item.id} />
        <button type="submit" className={btnDanger}>
          Delete item
        </button>
      </form>
    </div>
  );
}
