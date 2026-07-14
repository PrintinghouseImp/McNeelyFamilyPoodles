/** Brand tokens and shared site config for McNeely Family Poodles */

export const SITE = {
  name: "McNeely Family Poodles",
  tagline: "Elite Miniature Poodles • Phoenix, Arizona",
  location: "Phoenix, Arizona",
  description:
    "Boutique family-run miniature poodle breeders in the Phoenix area. Health-tested, home-raised companions.",
} as const;

/**
 * Visual style (Good Dog–inspired): white background, black lettering,
 * grayscale links and unhighlighted fields. Use color sparingly (e.g. status).
 * CSS tokens: `src/app/globals.css`
 */
export const BRAND = {
  /** Near-black body / headings */
  ink: "#111111",
  /** Page background */
  white: "#FFFFFF",
  /** Subtle section / card fill */
  surface: "#F9FAFB",
  /** Secondary copy & default nav/links */
  muted: "#6B7280",
  /** Slightly stronger secondary */
  mutedStrong: "#4B5563",
  /** Borders / hairlines */
  border: "#E5E7EB",
} as const;

/** Public marketing navigation */
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/puppies", label: "Puppies" },
  { href: "/parents", label: "Sires & Dams" },
  { href: "/about", label: "About Us" },
  { href: "/articles", label: "Articles" },
  { href: "/apply", label: "Application" },
  { href: "/shop", label: "Shop" },
  { href: "/social", label: "Social" },
] as const;

export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/puppies", label: "Puppies" },
  { href: "/admin/parents", label: "Sires & Dams" },
  { href: "/admin/litters", label: "Litters" },
  { href: "/admin/medical", label: "Medical records" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/deposits", label: "Deposits" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/shop", label: "Shop" },
  { href: "/admin/social", label: "Social" },
  { href: "/admin/media", label: "Media" },
] as const;

export const PORTAL_NAV = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/applications", label: "My applications" },
  { href: "/portal/deposits", label: "Deposits" },
  { href: "/portal/dogs", label: "My dogs" },
] as const;
