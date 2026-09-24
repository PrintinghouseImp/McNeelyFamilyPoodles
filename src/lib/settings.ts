import { DEFAULT_SOCIAL_IMAGES } from "@/lib/constants";
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

export type SocialProfile = {
  platform: "Instagram" | "Facebook";
  href: string;
  imageUrl: string;
  isLive: boolean;
};

/** True when the value is a real profile URL, not a bare network homepage. */
export function isLiveSocialUrl(href: string): boolean {
  if (!href.startsWith("http://") && !href.startsWith("https://")) return false;
  const stripped = href.replace(/\/+$/, "").toLowerCase();
  return (
    stripped !== "https://instagram.com" &&
    stripped !== "https://www.instagram.com" &&
    stripped !== "http://instagram.com" &&
    stripped !== "http://www.instagram.com" &&
    stripped !== "https://facebook.com" &&
    stripped !== "https://www.facebook.com" &&
    stripped !== "http://facebook.com" &&
    stripped !== "http://www.facebook.com"
  );
}

/**
 * Instagram / Facebook profile cards — SiteSetting URLs + optional
 * thumbnail URLs, with ranch-photo fallbacks.
 */
export async function getSocialProfiles(): Promise<{
  instagram: SocialProfile;
  facebook: SocialProfile;
}> {
  const rows = await db.siteSetting.findMany({
    where: {
      key: {
        in: [
          "instagram_url",
          "facebook_url",
          "instagram_image_url",
          "facebook_image_url",
        ],
      },
    },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value.trim()]));

  const instagramHref = map.instagram_url || "";
  const facebookHref = map.facebook_url || "";

  return {
    instagram: {
      platform: "Instagram",
      href: instagramHref,
      imageUrl: map.instagram_image_url || DEFAULT_SOCIAL_IMAGES.instagram,
      isLive: isLiveSocialUrl(instagramHref),
    },
    facebook: {
      platform: "Facebook",
      href: facebookHref,
      imageUrl: map.facebook_image_url || DEFAULT_SOCIAL_IMAGES.facebook,
      isLive: isLiveSocialUrl(facebookHref),
    },
  };
}
