"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PuppyStatus, Sex } from "@/generated/prisma/client";
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

const STATUSES = new Set<string>(Object.values(PuppyStatus));

function revalidatePuppies(slug?: string) {
  revalidatePath("/admin/puppies");
  revalidatePath("/puppies");
  revalidatePath("/alumni");
  revalidatePath("/");
  if (slug) revalidatePath(`/puppies/${slug}`);
}

export async function createPuppy(formData: FormData) {
  await requireAdmin();

  const name = str(formData, "name");
  if (!name) throw new Error("Name is required");

  const sexRaw = str(formData, "sex");
  const sex = sexRaw === "FEMALE" ? Sex.FEMALE : Sex.MALE;
  const statusRaw = str(formData, "status") || "AVAILABLE";
  const status = (
    STATUSES.has(statusRaw) ? statusRaw : "AVAILABLE"
  ) as PuppyStatus;

  // Slug is always derived from the name (not editable in admin)
  const slug = await uniqueSlug(slugify(name), async (s) => {
    const found = await db.puppy.findUnique({ where: { slug: s } });
    return Boolean(found);
  });

  const litterId = optionalStr(formData, "litterId");

  const isAdopted = bool(formData, "isAdopted");
  // Adopted puppies belong on Alumni; keep status aligned with SOLD when adopting
  const resolvedStatus: PuppyStatus = isAdopted
    ? ("SOLD" as PuppyStatus)
    : status;

  const puppy = await db.puppy.create({
    data: {
      name,
      slug,
      sex,
      status: resolvedStatus,
      color: optionalStr(formData, "color"),
      priceCents: dollarsToCents(formData, "priceDollars"),
      description: optionalStr(formData, "description"),
      birthDate: dateOnly(formData, "birthDate"),
      litterId,
      isAdopted,
      isPublished: bool(formData, "isPublished"),
      sortOrder: num(formData, "sortOrder") ?? 0,
    },
  });

  revalidatePuppies(puppy.slug);
  redirect(`/admin/puppies/${puppy.id}`);
}

export async function updatePuppy(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id");
  if (!id) throw new Error("Missing puppy id");

  const existing = await db.puppy.findUnique({ where: { id } });
  if (!existing) throw new Error("Puppy not found");

  const name = str(formData, "name") || existing.name;
  const sexRaw = str(formData, "sex");
  const sex = sexRaw === "FEMALE" ? Sex.FEMALE : Sex.MALE;
  const statusRaw = str(formData, "status") || existing.status;
  const status = (
    STATUSES.has(statusRaw) ? statusRaw : existing.status
  ) as PuppyStatus;

  // Re-derive slug when the name changes
  let slug = existing.slug;
  if (name !== existing.name) {
    slug = await uniqueSlug(slugify(name), async (s) => {
      const found = await db.puppy.findUnique({ where: { slug: s } });
      return Boolean(found) && found?.id !== id;
    });
  }

  const litterId = optionalStr(formData, "litterId");
  const isAdopted = bool(formData, "isAdopted");
  // Checking Adopted moves the puppy to Alumni and sets status Sold
  const resolvedStatus: PuppyStatus = isAdopted
    ? ("SOLD" as PuppyStatus)
    : status;

  await db.puppy.update({
    where: { id },
    data: {
      name,
      slug,
      sex,
      status: resolvedStatus,
      color: optionalStr(formData, "color"),
      priceCents: dollarsToCents(formData, "priceDollars"),
      description: optionalStr(formData, "description"),
      birthDate: dateOnly(formData, "birthDate"),
      litterId,
      isAdopted,
      isPublished: bool(formData, "isPublished"),
      sortOrder: num(formData, "sortOrder") ?? 0,
    },
  });

  revalidatePuppies(existing.slug);
  revalidatePuppies(slug);
  redirect(`/admin/puppies/${id}`);
}

export async function deletePuppy(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  if (!id) throw new Error("Missing puppy id");

  const existing = await db.puppy.findUnique({ where: { id } });
  if (!existing) throw new Error("Puppy not found");

  await db.puppy.delete({ where: { id } });
  revalidatePuppies(existing.slug);
  redirect("/admin/puppies");
}
