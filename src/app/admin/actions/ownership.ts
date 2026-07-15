"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { optionalStr, str } from "@/lib/form";

function revalidateOwnership(userId: string, puppyId: string) {
  revalidatePath(`/admin/puppies/${puppyId}`);
  revalidatePath("/admin/ownerships");
  revalidatePath("/admin/puppies");
  revalidatePath("/admin");
  revalidatePath("/portal");
  revalidatePath("/portal/dogs");
  revalidatePath(`/portal/dogs/${puppyId}`);
  void userId;
}

function puppyOwnerRedirect(
  puppyId: string,
  query: Record<string, string>,
): never {
  const params = new URLSearchParams(query);
  redirect(`/admin/puppies/${puppyId}?${params.toString()}`);
}

/**
 * Grant a customer portal access to a puppy's Phase 4 medical records.
 * Customer must already have a portal account (signed in via OAuth at least once).
 */
export async function grantDogOwnership(formData: FormData) {
  await requireAdmin();

  const puppyId = str(formData, "puppyId");
  if (!puppyId) throw new Error("Missing puppy");

  const puppy = await db.puppy.findUnique({
    where: { id: puppyId },
    select: { id: true, name: true },
  });
  if (!puppy) {
    puppyOwnerRedirect(puppyId, {
      ownerError: "Puppy not found",
    });
  }

  const email = str(formData, "email").toLowerCase();
  if (!email || !email.includes("@")) {
    puppyOwnerRedirect(puppyId, {
      ownerError: "Enter a valid customer email",
    });
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    puppyOwnerRedirect(puppyId, {
      ownerError:
        "No portal account for that email. The customer must sign in to the portal (Google/Facebook) first.",
    });
  }

  const notes = optionalStr(formData, "notes");

  const existing = await db.dogOwnership.findUnique({
    where: {
      userId_puppyId: { userId: user.id, puppyId },
    },
  });
  if (existing) {
    puppyOwnerRedirect(puppyId, {
      ownerError: `${user.email} already has access to ${puppy.name}.`,
    });
  }

  await db.dogOwnership.create({
    data: {
      userId: user.id,
      puppyId,
      notes,
    },
  });

  revalidateOwnership(user.id, puppyId);
  puppyOwnerRedirect(puppyId, {
    ownerGranted: user.email,
  });
}

export async function revokeDogOwnership(formData: FormData) {
  await requireAdmin();

  const ownershipId = str(formData, "ownershipId");
  if (!ownershipId) throw new Error("Missing ownership id");

  const existing = await db.dogOwnership.findUnique({
    where: { id: ownershipId },
    select: { id: true, userId: true, puppyId: true },
  });
  if (!existing) throw new Error("Ownership not found");

  const puppyId = existing.puppyId;
  await db.dogOwnership.delete({ where: { id: ownershipId } });
  revalidateOwnership(existing.userId, puppyId);

  // Prefer return to puppy page when we know it; ownerships list also uses this action
  const returnTo = str(formData, "returnTo");
  if (returnTo === "ownerships") {
    redirect("/admin/ownerships?revoked=1");
  }
  puppyOwnerRedirect(puppyId, { ownerRevoked: "1" });
}
