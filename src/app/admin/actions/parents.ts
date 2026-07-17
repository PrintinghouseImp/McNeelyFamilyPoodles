"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Sex } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { bool, num, optionalStr, str } from "@/lib/form";
import { slugify, uniqueSlug } from "@/lib/slug";

function revalidateParents(slug?: string) {
  revalidatePath("/admin/parents");
  revalidatePath("/parents");
  revalidatePath("/alumni");
  revalidatePath("/");
  if (slug) revalidatePath(`/parents/${slug}`);
}

export async function createParent(formData: FormData) {
  await requireAdmin();

  const name = str(formData, "name");
  if (!name) throw new Error("Name is required");

  const sexRaw = str(formData, "sex");
  const sex = sexRaw === "FEMALE" ? Sex.FEMALE : Sex.MALE;

  let slug = slugify(str(formData, "slug") || name);
  slug = await uniqueSlug(slug, async (s) => {
    const found = await db.parentDog.findUnique({ where: { slug: s } });
    return Boolean(found);
  });

  const parent = await db.parentDog.create({
    data: {
      name,
      slug,
      sex,
      color: optionalStr(formData, "color"),
      weightLbs: num(formData, "weightLbs"),
      heightInches: num(formData, "heightInches"),
      genetics: optionalStr(formData, "genetics"),
      description: optionalStr(formData, "description"),
      isRetired: bool(formData, "isRetired"),
      isPublished: bool(formData, "isPublished"),
      sortOrder: num(formData, "sortOrder") ?? 0,
    },
  });

  revalidateParents(parent.slug);
  redirect(`/admin/parents/${parent.id}`);
}

export async function updateParent(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id");
  if (!id) throw new Error("Missing parent id");

  const existing = await db.parentDog.findUnique({ where: { id } });
  if (!existing) throw new Error("Parent not found");

  const name = str(formData, "name") || existing.name;
  const sexRaw = str(formData, "sex");
  const sex = sexRaw === "FEMALE" ? Sex.FEMALE : Sex.MALE;

  let slug = slugify(str(formData, "slug") || name);
  if (slug !== existing.slug) {
    slug = await uniqueSlug(slug, async (s) => {
      const found = await db.parentDog.findUnique({ where: { slug: s } });
      return Boolean(found) && found?.id !== id;
    });
  }

  await db.parentDog.update({
    where: { id },
    data: {
      name,
      slug,
      sex,
      color: optionalStr(formData, "color"),
      weightLbs: num(formData, "weightLbs"),
      heightInches: num(formData, "heightInches"),
      genetics: optionalStr(formData, "genetics"),
      description: optionalStr(formData, "description"),
      isRetired: bool(formData, "isRetired"),
      isPublished: bool(formData, "isPublished"),
      sortOrder: num(formData, "sortOrder") ?? 0,
    },
  });

  revalidateParents(existing.slug);
  revalidateParents(slug);
  redirect(`/admin/parents/${id}`);
}

export async function deleteParent(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (!id) throw new Error("Missing parent id");

  const existing = await db.parentDog.findUnique({ where: { id } });
  if (!existing) throw new Error("Parent not found");

  // Block delete if used on litters
  const litterCount = await db.litter.count({
    where: { OR: [{ damId: id }, { sireId: id }] },
  });
  if (litterCount > 0) {
    throw new Error(
      "Cannot delete a parent that is linked to litters. Unlink or delete those litters first.",
    );
  }

  await db.parentDog.delete({ where: { id } });
  revalidateParents(existing.slug);
  redirect("/admin/parents");
}
