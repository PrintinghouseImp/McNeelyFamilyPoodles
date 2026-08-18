import { db } from "@/lib/db";

/**
 * Open Stripe payment links visible to a portal user:
 * - assigned userId, or
 * - customerEmail matches the signed-in account email (case-insensitive)
 */
function portalAccessFilter(userId: string, email?: string | null) {
  const emailNorm = email?.trim().toLowerCase();
  if (emailNorm) {
    return {
      OR: [
        { userId },
        { customerEmail: { equals: emailNorm, mode: "insensitive" as const } },
      ],
    };
  }
  return { userId };
}

export async function getPortalOpenPayments(
  userId: string,
  email?: string | null,
) {
  return db.paymentCheckout.findMany({
    where: {
      status: "OPEN",
      ...portalAccessFilter(userId, email),
    },
    orderBy: { createdAt: "desc" },
    include: {
      puppy: { select: { name: true, slug: true } },
    },
  });
}

export async function getPortalPayments(
  userId: string,
  email?: string | null,
) {
  return db.paymentCheckout.findMany({
    where: portalAccessFilter(userId, email),
    orderBy: { createdAt: "desc" },
    include: {
      puppy: { select: { name: true, slug: true } },
    },
  });
}

/**
 * If admin only entered an email, attach the matching portal User when present.
 */
export async function resolvePortalUserIdByEmail(
  email: string | null | undefined,
  existingUserId?: string | null,
): Promise<string | null> {
  if (existingUserId) return existingUserId;
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return null;
  const user = await db.user.findFirst({
    where: { email: { equals: normalized, mode: "insensitive" } },
    select: { id: true },
  });
  return user?.id ?? null;
}
