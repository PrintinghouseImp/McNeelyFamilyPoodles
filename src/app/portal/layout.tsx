/**
 * All /portal/* routes must be dynamic on Netlify/OpenNext.
 * Prerendered portal pages caused "nextHandler is not a function" at runtime.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Root portal layout — login is unauthenticated; (app) group adds chrome + auth.
 */
export default function PortalRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      {children}
    </div>
  );
}
