"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  DepositMethod,
  DepositStatus,
} from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { optionalStr, str } from "@/lib/form";
import { isPortalRole } from "@/lib/portal";
import {
  depositRequestSchema,
  depositStatusSchema,
} from "@/lib/validations/deposit";

export type DepositFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function revalidateDeposits(id?: string) {
  revalidatePath("/portal/deposits");
  revalidatePath("/portal");
  revalidatePath("/admin/deposits");
  revalidatePath("/admin");
  if (id) revalidatePath(`/admin/deposits/${id}`);
}

function dollarsToCents(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  const n = Number(value.trim());
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

/**
 * Customer: submit a deposit/reservation request (manual payment rails).
 */
export async function submitDepositRequest(
  _prev: DepositFormState,
  formData: FormData,
): Promise<DepositFormState> {
  const session = await auth();
  if (!session?.user?.id || !isPortalRole(session.user.role)) {
    redirect(
      `/portal/login?callbackUrl=${encodeURIComponent("/portal/deposits/new")}`,
    );
  }

  const raw = {
    name: str(formData, "name"),
    email: str(formData, "email").toLowerCase(),
    phone: optionalStr(formData, "phone") ?? "",
    method: str(formData, "method"),
    amountDollars: optionalStr(formData, "amountDollars") ?? "",
    customerNote: optionalStr(formData, "customerNote") ?? "",
    puppyId: optionalStr(formData, "puppyId") ?? "",
  };

  const parsed = depositRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: "Please check the form and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const data = parsed.data;
  const amountCents = dollarsToCents(data.amountDollars);
  if (data.amountDollars && amountCents == null) {
    return {
      error: "Enter a valid deposit amount in dollars, or leave it blank.",
      fieldErrors: { amountDollars: ["Invalid amount"] },
    };
  }

  let puppyId: string | null = data.puppyId || null;
  if (puppyId) {
    const puppy = await db.puppy.findFirst({
      where: { id: puppyId, isPublished: true },
      select: { id: true },
    });
    if (!puppy) {
      return { error: "That puppy is not available for a deposit request." };
    }
  }

  await db.depositRequest.create({
    data: {
      userId: session.user.id,
      puppyId,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      method: data.method as DepositMethod,
      amountCents,
      customerNote: data.customerNote || null,
      status: DepositStatus.REQUESTED,
    },
  });

  revalidateDeposits();
  redirect("/portal/deposits?submitted=1");
}

/**
 * Admin: update deposit status and optional admin note.
 * Sets paidAt when status becomes PAID.
 */
export async function updateDepositStatus(formData: FormData) {
  await requireAdmin();

  const id = str(formData, "id");
  const statusRaw = str(formData, "status");
  const adminNote = optionalStr(formData, "adminNote");

  if (!id) throw new Error("Missing deposit id");

  const statusParsed = depositStatusSchema.safeParse(statusRaw);
  if (!statusParsed.success) throw new Error("Invalid status");

  const existing = await db.depositRequest.findUnique({ where: { id } });
  if (!existing) throw new Error("Deposit request not found");

  const status = statusParsed.data as DepositStatus;
  const paidAt =
    status === "PAID"
      ? existing.paidAt ?? new Date()
      : status === "REFUNDED" || status === "CANCELLED"
        ? existing.paidAt
        : status === "REQUESTED" || status === "AWAITING_PAYMENT"
          ? null
          : existing.paidAt;

  await db.depositRequest.update({
    where: { id },
    data: {
      status,
      adminNote: adminNote,
      paidAt,
    },
  });

  revalidateDeposits(id);
  redirect(`/admin/deposits/${id}`);
}
