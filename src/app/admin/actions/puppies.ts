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

async function litterIdForParents(
  damId: string | null,
  sireId: string | null,
  birthDate: Date | null,
): Promise<string | null> {
  if (!damId && !sireId) return null;
  if (!damId || !sireId) {
    throw new Error("Select both a dam and a sire, or leave both blank.");
  }

  const [dam, sire] = await Promise.all([
    db.parentDog.findUnique({ where: { id: damId } }),
    db.parentDog.findUnique({ where: { id: sireId } }),
  ]);
  if (!dam || dam.sex !== Sex.FEMALE) throw new Error("Choose a dam.");
  if (!sire || sire.sex !== Sex.MALE) throw new Error("Choose a sire.");

  const matches = await db.litter.findMany({
    where: { damId, sireId },
    orderBy: { birthDate: "desc" },
  });
  if (birthDate) {
    const day = birthDate.toISOString().slice(0, 10);
    const sameDay = matches.find(
      (litter) => litter.birthDate.toISOString().slice(0, 10) === day,
    );
    if (sameDay) return sameDay.id;
  }
  if (matches[0]) return matches[0].id;

  const slug = await uniqueSlug(
    slugify(`${dam.name} ${sire.name}`) || "litter",
    async (candidate) =>
      Boolean(await db.litter.findUnique({ where: { slug: candidate } })),
  );
  const created = await db.litter.create({
    data: {
      slug,
      name: `${dam.name} × ${sire.name}`,
      birthDate: birthDate ?? new Date(),
      damId,
      sireId,
      isPublished: true,
    },
  });
  revalidatePath("/admin/litters");
  return created.id;
}

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

  const litterId = await litterIdForParents(
    optionalStr(formData, "damId"),
    optionalStr(formData, "sireId"),
    dateOnly(formData, "birthDate"),
  );

  const isAdopted = bool(formData, "isAdopted");
  // Alumni flag sets status to Sold and removes the puppy from the main list.
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

  const litterId = await litterIdForParents(
    optionalStr(formData, "damId"),
    optionalStr(formData, "sireId"),
    dateOnly(formData, "birthDate"),
  );
  const isAdopted = bool(formData, "isAdopted");
  // Alumni flag sets status to Sold and removes the puppy from the main list.
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
