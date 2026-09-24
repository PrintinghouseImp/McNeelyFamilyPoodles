import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** Signed-in customer or admin may use the customer portal. */
export async function requirePortalUser() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id || (role !== "CUSTOMER" && role !== "ADMIN")) {
    redirect("/portal/login");
  }
  return session;
}

export function isPortalRole(role: string | undefined | null): boolean {
  return role === "CUSTOMER" || role === "ADMIN";
}

/**
 * Portal OAuth return path. Allows portal pages and the medical download route.
 * Rejects protocol-relative and off-site URLs.
 */
export function safePortalCallback(
  raw: string | null | undefined,
  fallback = "/portal",
): string {
  if (!raw) return fallback;
  if (
    !raw.startsWith("/") ||
    raw.startsWith("//") ||
    raw.includes("\\") ||
    raw.includes("..")
  ) {
    return fallback;
  }
  if (raw.startsWith("/api/vault/") && raw.length > "/api/vault/".length) {
    return raw;
  }
  if (raw.startsWith("/portal") && !raw.startsWith("/portal/login")) {
    return raw;
  }
  return fallback;
}

/**
 * Ensure the signed-in portal user owns this puppy (or is admin browsing as portal).
 * Admins may open any vault for support; customers only their grants.
 */
export const requireOwnedPuppy = cache(async function requireOwnedPuppy(puppyId: string) {
  const session = await requirePortalUser();
  const userId = session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  const puppy = await db.puppy.findUnique({
    where: { id: puppyId },
    include: {
      photos: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        take: 1,
      },
      medicalRecords: {
        orderBy: [{ recordDate: "desc" }, { createdAt: "desc" }],
      },
      litter: {
        select: {
          name: true,
          slug: true,
          dam: { select: { name: true } },
          sire: { select: { name: true } },
        },
      },
    },
  });
  if (!puppy) notFound();

  const ownership = await db.dogOwnership.findUnique({
    where: {
      userId_puppyId: { userId, puppyId },
    },
  });

  if (!ownership && !isAdmin) {
    notFound();
  }

  return { session, puppy, ownership };
});
