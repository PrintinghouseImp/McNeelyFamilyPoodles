import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type VaultFileRecord = {
  id: string;
  title: string;
  fileUrl: string;
};

/**
 * Who may download a medical file.
 * Admins: any parent or puppy record.
 * Customers: puppy records only, and only when they have a DogOwnership row.
 * Missing access is 404 so parent-only files are not confirmed to exist.
 */
export async function authorizeMedicalDownload(recordId: string): Promise<
  | { ok: true; record: VaultFileRecord }
  | { ok: false; status: 401 | 404 }
> {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id || (role !== "ADMIN" && role !== "CUSTOMER")) {
    return { ok: false, status: 401 };
  }

  const record = await db.medicalRecord.findUnique({
    where: { id: recordId },
    select: {
      id: true,
      title: true,
      fileUrl: true,
      puppyId: true,
      parentDogId: true,
    },
  });
  if (!record?.fileUrl) return { ok: false, status: 404 };

  if (role === "ADMIN") {
    return {
      ok: true,
      record: { id: record.id, title: record.title, fileUrl: record.fileUrl },
    };
  }

  if (!record.puppyId || record.parentDogId) {
    return { ok: false, status: 404 };
  }

  const ownership = await db.dogOwnership.findUnique({
    where: {
      userId_puppyId: { userId: session.user.id, puppyId: record.puppyId },
    },
    select: { id: true },
  });
  if (!ownership) return { ok: false, status: 404 };

  return {
    ok: true,
    record: { id: record.id, title: record.title, fileUrl: record.fileUrl },
  };
}
