"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { dateOnly, optionalStr, str } from "@/lib/form";
import {
  deleteLocalUpload,
  saveUploadedDocument,
} from "@/lib/uploads";

function revalidateMedical(parentDogId?: string | null, puppyId?: string | null) {
  revalidatePath("/admin/medical");
  if (parentDogId) {
    revalidatePath(`/admin/parents/${parentDogId}`);
    revalidatePath(`/admin/medical?parent=${parentDogId}`);
  }
  if (puppyId) {
    revalidatePath(`/admin/puppies/${puppyId}`);
    revalidatePath(`/admin/medical?puppy=${puppyId}`);
    // Owners see these records in the portal vault
    revalidatePath(`/portal/dogs/${puppyId}`);
    revalidatePath("/portal/dogs");
  }
}

function parseDogTargets(formData: FormData): {
  parentDogId: string | null;
  puppyId: string | null;
} {
  const target = str(formData, "target"); // "parent:ID" | "puppy:ID"
  if (target.startsWith("parent:")) {
    return { parentDogId: target.slice(7), puppyId: null };
  }
  if (target.startsWith("puppy:")) {
    return { parentDogId: null, puppyId: target.slice(6) };
  }
  // legacy / explicit fields
  return {
    parentDogId: optionalStr(formData, "parentDogId"),
    puppyId: optionalStr(formData, "puppyId"),
  };
}

export async function createMedicalRecord(formData: FormData) {
  await requireAdmin();

  const title = str(formData, "title");
  if (!title) {
    throw new Error("Title (label) is required so the file is identified correctly");
  }

  const { parentDogId, puppyId } = parseDogTargets(formData);
  if (!parentDogId && !puppyId) {
    throw new Error("Select a parent or puppy for this medical record");
  }
  if (parentDogId && puppyId) {
    throw new Error("Attach the record to either a parent or a puppy, not both");
  }

  if (parentDogId) {
    const p = await db.parentDog.findUnique({ where: { id: parentDogId } });
    if (!p) throw new Error("Parent not found");
  }
  if (puppyId) {
    const p = await db.puppy.findUnique({ where: { id: puppyId } });
    if (!p) throw new Error("Puppy not found");
  }

  let fileUrl: string | null = null;
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    const saved = await saveUploadedDocument(
      file,
      `medical/${parentDogId ?? puppyId}`,
    );
    fileUrl = saved.url;
  }

  const record = await db.medicalRecord.create({
    data: {
      title,
      recordDate: dateOnly(formData, "recordDate"),
      notes: optionalStr(formData, "notes"),
      fileUrl,
      parentDogId,
      puppyId,
    },
  });

  revalidateMedical(parentDogId, puppyId);
  redirect(`/admin/medical/${record.id}`);
}

export async function updateMedicalRecord(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id");
  if (!id) throw new Error("Missing record id");

  const existing = await db.medicalRecord.findUnique({ where: { id } });
  if (!existing) throw new Error("Medical record not found");

  const title = str(formData, "title") || existing.title;
  if (!title) {
    throw new Error("Title (label) is required so the file is identified correctly");
  }

  const { parentDogId, puppyId } = parseDogTargets(formData);
  const nextParent = parentDogId ?? null;
  const nextPuppy = puppyId ?? null;

  if (!nextParent && !nextPuppy) {
    throw new Error("Select a parent or puppy for this medical record");
  }
  if (nextParent && nextPuppy) {
    throw new Error("Attach the record to either a parent or a puppy, not both");
  }

  let fileUrl = existing.fileUrl;
  const removeFile = str(formData, "removeFile") === "1";
  const file = formData.get("file");

  if (removeFile && fileUrl) {
    await deleteLocalUpload(fileUrl);
    fileUrl = null;
  }

  if (file instanceof File && file.size > 0) {
    if (fileUrl) await deleteLocalUpload(fileUrl);
    const saved = await saveUploadedDocument(
      file,
      `medical/${nextParent ?? nextPuppy}`,
    );
    fileUrl = saved.url;
  }

  await db.medicalRecord.update({
    where: { id },
    data: {
      title,
      recordDate: dateOnly(formData, "recordDate"),
      notes: optionalStr(formData, "notes"),
      fileUrl,
      parentDogId: nextParent,
      puppyId: nextPuppy,
    },
  });

  revalidateMedical(existing.parentDogId, existing.puppyId);
  revalidateMedical(nextParent, nextPuppy);
  redirect(`/admin/medical/${id}`);
}

export async function deleteMedicalRecord(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id");
  if (!id) throw new Error("Missing record id");

  const existing = await db.medicalRecord.findUnique({ where: { id } });
  if (!existing) throw new Error("Medical record not found");

  if (existing.fileUrl) {
    await deleteLocalUpload(existing.fileUrl);
  }

  await db.medicalRecord.delete({ where: { id } });
  revalidateMedical(existing.parentDogId, existing.puppyId);
  redirect("/admin/medical");
}
