"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { bool, dateOnly, optionalStr, str } from "@/lib/form";
import { slugify, uniqueSlug } from "@/lib/slug";

function revalidateLitters() {
  revalidatePath("/admin/litters");
  revalidatePath("/admin/puppies");
  revalidatePath("/puppies");
  revalidatePath("/parents");
  revalidatePath("/");
}

export async function createLitter(formData: FormData) {
  await requireAdmin();

  const damId = str(formData, "damId");
  const sireId = str(formData, "sireId");
  const birthDate = dateOnly(formData, "birthDate");
  if (!damId || !sireId || !birthDate) {
    throw new Error("Dam, sire, and birth date are required");
  }

  const name = optionalStr(formData, "name");
  const base =
    str(formData, "slug") ||
    name ||
    `${birthDate.toISOString().slice(0, 10)}-litter`;

  const slug = await uniqueSlug(slugify(base), async (s) => {
    const found = await db.litter.findUnique({ where: { slug: s } });
    return Boolean(found);
  });

  const litter = await db.litter.create({
    data: {
      slug,
      name,
      birthDate,
      damId,
      sireId,
      notes: optionalStr(formData, "notes"),
      isPublished: bool(formData, "isPublished"),
    },
  });

  revalidateLitters();
  redirect(`/admin/litters/${litter.id}`);
}

export async function updateLitter(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id");
  if (!id) throw new Error("Missing litter id");

  const existing = await db.litter.findUnique({ where: { id } });
  if (!existing) throw new Error("Litter not found");

  const damId = str(formData, "damId") || existing.damId;
  const sireId = str(formData, "sireId") || existing.sireId;
  const birthDate = dateOnly(formData, "birthDate") ?? existing.birthDate;
  const name = optionalStr(formData, "name");

  let slug = slugify(
    str(formData, "slug") ||
      name ||
      existing.slug ||
      `${birthDate.toISOString().slice(0, 10)}-litter`,
  );
  if (slug !== existing.slug) {
    slug = await uniqueSlug(slug, async (s) => {
      const found = await db.litter.findUnique({ where: { slug: s } });
      return Boolean(found) && found?.id !== id;
    });
  }

  await db.litter.update({
    where: { id },
    data: {
      slug,
      name,
      birthDate,
      damId,
      sireId,
      notes: optionalStr(formData, "notes"),
      isPublished: bool(formData, "isPublished"),
    },
  });

  revalidateLitters();
  redirect(`/admin/litters/${id}`);
}

export async function deleteLitter(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (!id) throw new Error("Missing litter id");

  await db.litter.delete({ where: { id } });
  revalidateLitters();
  redirect("/admin/litters");
}
