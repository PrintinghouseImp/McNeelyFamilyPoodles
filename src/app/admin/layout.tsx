/**
 * All /admin/* routes must be dynamic on Netlify/OpenNext.
 * Prerendered admin pages caused "nextHandler is not a function" at runtime.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
