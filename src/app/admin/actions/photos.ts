"use server";

import { revalidatePath } from "next/cache";
import { PhotoEntity } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { bool, str } from "@/lib/form";
import { deleteLocalUpload, saveUploadedImage } from "@/lib/uploads";

type EntityKind = "PARENT" | "PUPPY" | "LITTER";

async function revalidateEntity(kind: EntityKind, entityId: string) {
  revalidatePath("/admin/media");
  if (kind === "PARENT") {
    revalidatePath("/admin/parents");
    revalidatePath(`/admin/parents/${entityId}`);
    revalidatePath("/parents");
    const p = await db.parentDog.findUnique({ where: { id: entityId } });
    if (p) revalidatePath(`/parents/${p.slug}`);
  } else if (kind === "PUPPY") {
    revalidatePath("/admin/puppies");
    revalidatePath(`/admin/puppies/${entityId}`);
    revalidatePath("/puppies");
    revalidatePath("/");
    const p = await db.puppy.findUnique({ where: { id: entityId } });
    if (p) revalidatePath(`/puppies/${p.slug}`);
  } else {
    revalidatePath("/admin/litters");
    revalidatePath(`/admin/litters/${entityId}`);
    revalidatePath("/puppies");
  }
}

async function clearPrimary(kind: EntityKind, entityId: string) {
  if (kind === "PARENT") {
    await db.photo.updateMany({
      where: { parentDogId: entityId, isPrimary: true },
      data: { isPrimary: false },
    });
  } else if (kind === "PUPPY") {
    await db.photo.updateMany({
      where: { puppyId: entityId, isPrimary: true },
      data: { isPrimary: false },
    });
  } else {
    await db.photo.updateMany({
      where: { litterId: entityId, isPrimary: true },
      data: { isPrimary: false },
    });
  }
}

export async function uploadPhoto(formData: FormData) {
  await requireAdmin();

  const kind = str(formData, "entityType") as EntityKind;
  const entityId = str(formData, "entityId");
  if (!entityId || !["PARENT", "PUPPY", "LITTER"].includes(kind)) {
    throw new Error("Invalid photo target");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Choose an image file");
  }

  const isPrimary = bool(formData, "isPrimary");
  const alt = str(formData, "alt") || null;

  const saved = await saveUploadedImage(
    file,
    `${kind.toLowerCase()}/${entityId}`,
  );

  if (isPrimary) {
    await clearPrimary(kind, entityId);
  }

  const maxSort = await db.photo.aggregate({
    where:
      kind === "PARENT"
        ? { parentDogId: entityId }
        : kind === "PUPPY"
          ? { puppyId: entityId }
          : { litterId: entityId },
    _max: { sortOrder: true },
  });

  await db.photo.create({
    data: {
      url: saved.url,
      alt,
      isPrimary,
      entityType:
        kind === "PARENT"
          ? PhotoEntity.PARENT
          : kind === "PUPPY"
            ? PhotoEntity.PUPPY
            : PhotoEntity.LITTER,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      parentDogId: kind === "PARENT" ? entityId : null,
      puppyId: kind === "PUPPY" ? entityId : null,
      litterId: kind === "LITTER" ? entityId : null,
    },
  });

  await revalidateEntity(kind, entityId);
}

export async function setPrimaryPhoto(formData: FormData) {
  await requireAdmin();

  const photoId = str(formData, "photoId");
  const photo = await db.photo.findUnique({ where: { id: photoId } });
  if (!photo) throw new Error("Photo not found");

  let kind: EntityKind | null = null;
  let entityId = "";
  if (photo.parentDogId) {
    kind = "PARENT";
    entityId = photo.parentDogId;
  } else if (photo.puppyId) {
    kind = "PUPPY";
    entityId = photo.puppyId;
  } else if (photo.litterId) {
    kind = "LITTER";
    entityId = photo.litterId;
  }
  if (!kind || !entityId) throw new Error("Photo is not linked to inventory");

  await clearPrimary(kind, entityId);
  await db.photo.update({
    where: { id: photoId },
    data: { isPrimary: true },
  });

  await revalidateEntity(kind, entityId);
}

export async function deletePhoto(formData: FormData) {
  await requireAdmin();

  const photoId = str(formData, "photoId");
  const photo = await db.photo.findUnique({ where: { id: photoId } });
  if (!photo) throw new Error("Photo not found");

  await db.photo.delete({ where: { id: photoId } });
  await deleteLocalUpload(photo.url);

  if (photo.parentDogId) await revalidateEntity("PARENT", photo.parentDogId);
  if (photo.puppyId) await revalidateEntity("PUPPY", photo.puppyId);
  if (photo.litterId) await revalidateEntity("LITTER", photo.litterId);
}
