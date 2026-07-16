import Link from "next/link";
import {
  signInWithFacebook,
  signInWithGoogle,
} from "@/app/portal/actions";
import { oauthProviders } from "@/lib/auth";
import { SITE } from "@/lib/constants";
import { btnPrimary, btnSecondary } from "@/components/admin/field";

/** Never prerender — Netlify OpenNext breaks prerendered auth pages. */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Customer sign in",
};

type Props = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

/**
 * Login UI only — no server-side auth() call (avoids broken prerender handlers).
 * OAuth providers are read from env at request time via oauthProviders.
 */
export default async function PortalLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const callbackUrl =
    params.callbackUrl?.startsWith("/portal") &&
    !params.callbackUrl.startsWith("/portal/login")
      ? params.callbackUrl
      : "/portal";

  const errorMessage =
    params.error === "OAuthAccountNotLinked"
      ? "That email is already linked to another sign-in method. Try the original provider."
      : params.error
        ? "Sign-in failed. Please try again."
        : null;

  const anyOAuth = oauthProviders.google || oauthProviders.facebook;
  const publicOrigin =
    process.env.AUTH_URL?.replace(/\/$/, "") ||
    process.env.URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="mb-1 text-xs uppercase tracking-widest text-gray-400">
          Customer portal
        </p>
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-black">
          Sign in
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Use Google or Facebook to apply for a puppy, request a deposit, and
          access documents after adoption at {SITE.name}.
        </p>

        {errorMessage ? (
          <p
            className="mb-6 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        <div className="space-y-3">
          {oauthProviders.google ? (
            <form action={signInWithGoogle}>
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              <button type="submit" className={`${btnPrimary} w-full`}>
                Continue with Google
              </button>
            </form>
          ) : (
            <button
              type="button"
              disabled
              className={`${btnPrimary} w-full cursor-not-allowed opacity-40`}
              title="Set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in Netlify env"
            >
              Continue with Google
            </button>
          )}

          {oauthProviders.facebook ? (
            <form action={signInWithFacebook}>
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              <button type="submit" className={`${btnSecondary} w-full`}>
                Continue with Facebook
              </button>
            </form>
          ) : (
            <button
              type="button"
              disabled
              className={`${btnSecondary} w-full cursor-not-allowed opacity-40`}
              title="Set AUTH_FACEBOOK_ID and AUTH_FACEBOOK_SECRET in Netlify env"
            >
              Continue with Facebook
            </button>
          )}
        </div>

        {!anyOAuth ? (
          <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-medium">OAuth not configured yet</p>
            <p className="mt-1 text-amber-800/90">
              Add <code className="text-xs">AUTH_GOOGLE_ID</code> /{" "}
              <code className="text-xs">AUTH_GOOGLE_SECRET</code> (and/or
              Facebook keys) in Netlify environment variables. Redirect URI:
            </p>
            <p className="mt-2 break-all font-mono text-xs text-amber-950">
              {publicOrigin}/api/auth/callback/google
            </p>
          </div>
        ) : null}

        <p className="mt-8 text-xs text-gray-400">
          Admin staff should use{" "}
          <Link
            href="/admin/login"
            className="text-gray-600 underline-offset-2 hover:text-black hover:underline"
          >
            Admin portal
          </Link>
          .
        </p>
        <p className="mt-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-black">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
