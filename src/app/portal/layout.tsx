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
