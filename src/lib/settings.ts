import { db } from "@/lib/db";

export type PaymentHandles = {
  venmo: string;
  zelle: string;
  paypal: string;
};

/**
 * Payment handles for deposit UI — SiteSetting overrides env.
 */
export async function getPaymentHandles(): Promise<PaymentHandles> {
  const rows = await db.siteSetting.findMany({
    where: {
      key: { in: ["venmo_handle", "zelle_contact", "paypal_me_url"] },
    },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value.trim()]));

  return {
    venmo: map.venmo_handle || process.env.VENMO_HANDLE?.trim() || "",
    zelle: map.zelle_contact || process.env.ZELLE_CONTACT?.trim() || "",
    paypal: map.paypal_me_url || process.env.PAYPAL_ME_URL?.trim() || "",
  };
}

export function hasAnyPaymentHandle(h: PaymentHandles): boolean {
  return Boolean(h.venmo || h.zelle || h.paypal);
}
