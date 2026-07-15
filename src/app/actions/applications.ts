"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApplicationStatus } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { bool, optionalStr, str } from "@/lib/form";
import { isPortalRole } from "@/lib/portal";
import {
  applicationStatusSchema,
  puppyApplicationSchema,
} from "@/lib/validations/application";

export type ApplicationFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function revalidateApplications() {
  revalidatePath("/portal/applications");
  revalidatePath("/portal");
  revalidatePath("/admin/applications");
  revalidatePath("/admin");
}

/**
 * Submit a puppy application. Requires a signed-in customer (or admin).
 */
export async function submitApplication(
  _prev: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const session = await auth();
  if (!session?.user?.id || !isPortalRole(session.user.role)) {
    redirect(
      `/portal/login?callbackUrl=${encodeURIComponent("/apply")}`,
    );
  }

  const raw = {
    name: str(formData, "name"),
    email: str(formData, "email").toLowerCase(),
    phone: optionalStr(formData, "phone") ?? "",
    message: optionalStr(formData, "message") ?? "",
    homeType: optionalStr(formData, "homeType") ?? "",
    hasKids: bool(formData, "hasKids"),
    hasPets: bool(formData, "hasPets"),
    puppyId: optionalStr(formData, "puppyId") ?? "",
  };

  const parsed = puppyApplicationSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: "Please check the form and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  let puppyId: string | null = data.puppyId || null;

  if (puppyId) {
    const puppy = await db.puppy.findFirst({
      where: { id: puppyId, isPublished: true },
      select: { id: true },
    });
    if (!puppy) {
      return { error: "That puppy is not available for application." };
    }
  }

  await db.application.create({
    data: {
      userId: session.user.id,
      puppyId,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      message: data.message || null,
      homeType: data.homeType || null,
      hasKids: data.hasKids ?? null,
      hasPets: data.hasPets ?? null,
      status: ApplicationStatus.NEW,
    },
  });

  revalidateApplications();
  redirect("/portal/applications?submitted=1");
}

/**
 * Admin: update application status.
 */
export async function updateApplicationStatus(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id");
  const statusRaw = str(formData, "status");
  if (!id) throw new Error("Missing application id");

  const statusParsed = applicationStatusSchema.safeParse(statusRaw);
  if (!statusParsed.success) {
    throw new Error("Invalid status");
  }

  const existing = await db.application.findUnique({ where: { id } });
  if (!existing) throw new Error("Application not found");

  await db.application.update({
    where: { id },
    data: { status: statusParsed.data as ApplicationStatus },
  });

  revalidateApplications();
  revalidatePath(`/admin/applications/${id}`);
  redirect(`/admin/applications/${id}`);
}
