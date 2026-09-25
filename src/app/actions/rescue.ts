"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { bool, optionalStr, str } from "@/lib/form";
import { rescueApplicationSchema } from "@/lib/validations/rescue";

export type RescueFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function submitRescueApplication(
  _prev: RescueFormState,
  formData: FormData,
): Promise<RescueFormState> {
  const websiteRaw = str(formData, "website");
  const website = /^https?:\/\//i.test(websiteRaw)
    ? websiteRaw
    : websiteRaw
      ? `https://${websiteRaw}`
      : "";

  const parsed = rescueApplicationSchema.safeParse({
    organizationName: str(formData, "organizationName"),
    website,
    ein: str(formData, "ein"),
    confirms501c3: bool(formData, "confirms501c3") ? true : undefined,
    focus: str(formData, "focus"),
    contactName: str(formData, "contactName"),
    email: str(formData, "email").toLowerCase(),
    phone: optionalStr(formData, "phone") ?? "",
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const confirm = flat.fieldErrors.confirms501c3?.[0];
    return {
      error: confirm ?? "Please check the form and try again.",
      fieldErrors: flat.fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  await db.rescueApplication.create({
    data: {
      organizationName: data.organizationName,
      website: data.website,
      ein: data.ein,
      confirms501c3: true,
      focus: data.focus,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone || null,
    },
  });

  revalidatePath("/admin/rescue");
  redirect("/apply/rescue?submitted=1");
}
