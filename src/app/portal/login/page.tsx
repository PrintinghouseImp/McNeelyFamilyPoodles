export const metadata = {
  title: "Customer sign in",
};

export default function PortalLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="mb-1 text-xs uppercase tracking-widest text-gray-400">
          Portal
        </p>
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-black">
          Customer portal
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Sign in with Google or Facebook to apply, request a deposit, and
          access your dog&apos;s documents after adoption.
        </p>
        <ul className="space-y-3 text-sm text-gray-600">
          <li>• Google OAuth</li>
          <li>• Facebook OAuth</li>
          <li>
            • Email signup (if enabled) requires Cloudflare Turnstile bot check
          </li>
        </ul>
        <p className="mt-8 text-xs text-gray-400">
          Admin staff should use{" "}
          <a
            href="/admin/login"
            className="text-gray-600 underline-offset-2 hover:text-black hover:underline"
          >
            /admin/login
          </a>
          .
        </p>
      </div>
    </div>
  );
}
