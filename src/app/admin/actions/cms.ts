"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PhotoEntity, ShopItemType } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import {
  bool,
  dateOnly,
  dollarsToCents,
  num,
  optionalStr,
  str,
} from "@/lib/form";
import { slugify, uniqueSlug } from "@/lib/slug";
import {
  deleteLocalUpload,
  saveUploadedImage,
} from "@/lib/uploads";

// ─── shared helpers ─────────────────────────────────────────────────────────

async function optionalImageUpload(
  formData: FormData,
  field: string,
  folder: string,
  existingUrl?: string | null,
): Promise<string | null> {
  const remove = str(formData, `remove_${field}`) === "1";
  if (remove && existingUrl) {
    await deleteLocalUpload(existingUrl);
    return null;
  }

  const file = formData.get(field);
  if (file instanceof File && file.size > 0) {
    if (existingUrl) await deleteLocalUpload(existingUrl);
    const saved = await saveUploadedImage(file, folder);
    return saved.url;
  }

  const urlField = optionalStr(formData, `${field}Url`);
  if (urlField) return urlField;

  return existingUrl ?? null;
}

// ─── Articles ───────────────────────────────────────────────────────────────

function revalidateArticles(slug?: string) {
  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  if (slug) revalidatePath(`/articles/${slug}`);
}

export async function createArticle(formData: FormData) {
  await requireAdmin();
  const title = str(formData, "title");
  const content = str(formData, "content");
  if (!title || !content) throw new Error("Title and content are required");

  const slug = await uniqueSlug(
    slugify(str(formData, "slug") || title),
    async (s) => Boolean(await db.article.findUnique({ where: { slug: s } })),
  );

  const isPublished = bool(formData, "isPublished");
  const coverUrl = await optionalImageUpload(
    formData,
    "cover",
    `articles/${slug}`,
  );

  const article = await db.article.create({
    data: {
      title,
      slug,
      content,
      excerpt: optionalStr(formData, "excerpt"),
      coverUrl,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
    },
  });

  revalidateArticles(article.slug);
  redirect(`/admin/articles/${article.id}`);
}

export async function updateArticle(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const existing = await db.article.findUnique({ where: { id } });
  if (!existing) throw new Error("Article not found");

  const title = str(formData, "title") || existing.title;
  const content = str(formData, "content") || existing.content;
  let slug = slugify(str(formData, "slug") || title);
  if (slug !== existing.slug) {
    slug = await uniqueSlug(slug, async (s) => {
      const found = await db.article.findUnique({ where: { slug: s } });
      return Boolean(found) && found?.id !== id;
    });
  }

  const isPublished = bool(formData, "isPublished");
  const coverUrl = await optionalImageUpload(
    formData,
    "cover",
    `articles/${slug}`,
    existing.coverUrl,
  );

  await db.article.update({
    where: { id },
    data: {
      title,
      slug,
      content,
      excerpt: optionalStr(formData, "excerpt"),
      coverUrl,
      isPublished,
      publishedAt: isPublished
        ? existing.publishedAt ?? new Date()
        : existing.publishedAt,
    },
  });

  revalidateArticles(existing.slug);
  revalidateArticles(slug);
  redirect(`/admin/articles/${id}`);
}

export async function deleteArticle(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const existing = await db.article.findUnique({ where: { id } });
  if (!existing) throw new Error("Article not found");
  if (existing.coverUrl) await deleteLocalUpload(existing.coverUrl);
  await db.article.delete({ where: { id } });
  revalidateArticles(existing.slug);
  redirect("/admin/articles");
}

// ─── Shop ───────────────────────────────────────────────────────────────────

function revalidateShop(slug?: string) {
  revalidatePath("/admin/shop");
  revalidatePath("/shop");
}

export async function createShopItem(formData: FormData) {
  await requireAdmin();
  const title = str(formData, "title");
  if (!title) throw new Error("Title is required");

  const slug = await uniqueSlug(
    slugify(str(formData, "slug") || title),
    async (s) => Boolean(await db.shopItem.findUnique({ where: { slug: s } })),
  );

  const typeRaw = str(formData, "type");
  const type =
    typeRaw === "PRODUCT" ? ShopItemType.PRODUCT : ShopItemType.AFFILIATE;

  const item = await db.shopItem.create({
    data: {
      title,
      slug,
      type,
      description: optionalStr(formData, "description"),
      url: optionalStr(formData, "url"),
      priceCents: dollarsToCents(formData, "priceDollars"),
      isPublished: bool(formData, "isPublished"),
      sortOrder: num(formData, "sortOrder") ?? 0,
    },
  });

  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const saved = await saveUploadedImage(file, `shop/${item.id}`);
    await db.photo.create({
      data: {
        url: saved.url,
        alt: title,
        isPrimary: true,
        entityType: PhotoEntity.SHOP,
        shopItemId: item.id,
        sortOrder: 0,
      },
    });
  }

  revalidateShop(item.slug);
  redirect(`/admin/shop/${item.id}`);
}

export async function updateShopItem(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const existing = await db.shopItem.findUnique({
    where: { id },
    include: { photos: true },
  });
  if (!existing) throw new Error("Shop item not found");

  const title = str(formData, "title") || existing.title;
  let slug = slugify(str(formData, "slug") || title);
  if (slug !== existing.slug) {
    slug = await uniqueSlug(slug, async (s) => {
      const found = await db.shopItem.findUnique({ where: { slug: s } });
      return Boolean(found) && found?.id !== id;
    });
  }

  const typeRaw = str(formData, "type");
  const type =
    typeRaw === "PRODUCT" ? ShopItemType.PRODUCT : ShopItemType.AFFILIATE;

  await db.shopItem.update({
    where: { id },
    data: {
      title,
      slug,
      type,
      description: optionalStr(formData, "description"),
      url: optionalStr(formData, "url"),
      priceCents: dollarsToCents(formData, "priceDollars"),
      isPublished: bool(formData, "isPublished"),
      sortOrder: num(formData, "sortOrder") ?? 0,
    },
  });

  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const primary = existing.photos.find((p) => p.isPrimary) ?? existing.photos[0];
    if (primary) {
      await deleteLocalUpload(primary.url);
      await db.photo.delete({ where: { id: primary.id } });
    }
    const saved = await saveUploadedImage(file, `shop/${id}`);
    await db.photo.create({
      data: {
        url: saved.url,
        alt: title,
        isPrimary: true,
        entityType: PhotoEntity.SHOP,
        shopItemId: id,
        sortOrder: 0,
      },
    });
  }

  revalidateShop(existing.slug);
  revalidateShop(slug);
  redirect(`/admin/shop/${id}`);
}

export async function deleteShopItem(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const existing = await db.shopItem.findUnique({
    where: { id },
    include: { photos: true },
  });
  if (!existing) throw new Error("Shop item not found");
  for (const p of existing.photos) await deleteLocalUpload(p.url);
  await db.shopItem.delete({ where: { id } });
  revalidateShop(existing.slug);
  redirect("/admin/shop");
}

// ─── Social posts + profile URLs ────────────────────────────────────────────

function revalidateSocial() {
  revalidatePath("/admin/social");
  revalidatePath("/social");
}

export async function updateSocialSettings(formData: FormData) {
  await requireAdmin();
  const pairs = [
    { key: "instagram_url", value: str(formData, "instagram_url") },
    { key: "facebook_url", value: str(formData, "facebook_url") },
  ];
  for (const setting of pairs) {
    await db.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  revalidateSocial();
  redirect("/admin/social?saved=1");
}

export async function createSocialPost(formData: FormData) {
  await requireAdmin();
  const platform = str(formData, "platform") || "Instagram";
  const postUrl = str(formData, "postUrl");
  if (!postUrl) throw new Error("Post URL is required");

  let imageUrl = optionalStr(formData, "imageUrl");
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const saved = await saveUploadedImage(file, "social");
    imageUrl = saved.url;
  }

  await db.socialPost.create({
    data: {
      platform,
      postUrl,
      caption: optionalStr(formData, "caption"),
      imageUrl,
      postedAt: dateOnly(formData, "postedAt"),
      isPublished: bool(formData, "isPublished"),
      sortOrder: num(formData, "sortOrder") ?? 0,
    },
  });

  revalidateSocial();
  redirect("/admin/social");
}

export async function updateSocialPost(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const existing = await db.socialPost.findUnique({ where: { id } });
  if (!existing) throw new Error("Post not found");

  let imageUrl = existing.imageUrl;
  if (str(formData, "remove_image") === "1" && imageUrl) {
    await deleteLocalUpload(imageUrl);
    imageUrl = null;
  }
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    if (imageUrl) await deleteLocalUpload(imageUrl);
    const saved = await saveUploadedImage(file, "social");
    imageUrl = saved.url;
  } else {
    const pasted = optionalStr(formData, "imageUrl");
    if (pasted) imageUrl = pasted;
  }

  await db.socialPost.update({
    where: { id },
    data: {
      platform: str(formData, "platform") || existing.platform,
      postUrl: str(formData, "postUrl") || existing.postUrl,
      caption: optionalStr(formData, "caption"),
      imageUrl,
      postedAt: dateOnly(formData, "postedAt"),
      isPublished: bool(formData, "isPublished"),
      sortOrder: num(formData, "sortOrder") ?? 0,
    },
  });

  revalidateSocial();
  redirect(`/admin/social/${id}`);
}

export async function deleteSocialPost(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const existing = await db.socialPost.findUnique({ where: { id } });
  if (!existing) throw new Error("Post not found");
  if (existing.imageUrl) await deleteLocalUpload(existing.imageUrl);
  await db.socialPost.delete({ where: { id } });
  revalidateSocial();
  redirect("/admin/social");
}

// ─── Forever Homes ──────────────────────────────────────────────────────────

function revalidateForever() {
  revalidatePath("/admin/forever-homes");
  revalidatePath("/forever-homes");
}

export async function createForeverHome(formData: FormData) {
  await requireAdmin();
  const dogName = str(formData, "dogName");
  const quote = str(formData, "quote");
  if (!dogName || !quote) throw new Error("Dog name and quote are required");

  const photoUrl = await optionalImageUpload(formData, "photo", "forever-homes");

  const story = await db.foreverHome.create({
    data: {
      dogName,
      quote,
      familyName: optionalStr(formData, "familyName"),
      location: optionalStr(formData, "location"),
      photoUrl,
      isPublished: bool(formData, "isPublished"),
      sortOrder: num(formData, "sortOrder") ?? 0,
      placedAt: dateOnly(formData, "placedAt"),
    },
  });

  revalidateForever();
  redirect(`/admin/forever-homes/${story.id}`);
}

export async function updateForeverHome(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const existing = await db.foreverHome.findUnique({ where: { id } });
  if (!existing) throw new Error("Story not found");

  const dogName = str(formData, "dogName") || existing.dogName;
  const quote = str(formData, "quote") || existing.quote;
  const photoUrl = await optionalImageUpload(
    formData,
    "photo",
    "forever-homes",
    existing.photoUrl,
  );

  await db.foreverHome.update({
    where: { id },
    data: {
      dogName,
      quote,
      familyName: optionalStr(formData, "familyName"),
      location: optionalStr(formData, "location"),
      photoUrl,
      isPublished: bool(formData, "isPublished"),
      sortOrder: num(formData, "sortOrder") ?? 0,
      placedAt: dateOnly(formData, "placedAt"),
    },
  });

  revalidateForever();
  redirect(`/admin/forever-homes/${id}`);
}

export async function deleteForeverHome(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  const existing = await db.foreverHome.findUnique({ where: { id } });
  if (!existing) throw new Error("Story not found");
  if (existing.photoUrl) await deleteLocalUpload(existing.photoUrl);
  await db.foreverHome.delete({ where: { id } });
  revalidateForever();
  redirect("/admin/forever-homes");
}
