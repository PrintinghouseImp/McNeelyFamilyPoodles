import { NextResponse } from "next/server";

/**
 * Lightweight deploy smoke check (no secrets).
 * GET /api/health
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "mcneely-family-poodles",
    commit: process.env.COMMIT_REF ?? process.env.CACHED_COMMIT_REF ?? null,
    context: process.env.CONTEXT ?? null,
    authUrlSet: Boolean(process.env.AUTH_URL || process.env.NEXTAUTH_URL),
    authSecretSet: Boolean(process.env.AUTH_SECRET),
    databaseUrlSet: Boolean(process.env.DATABASE_URL),
    r2Configured: Boolean(
      process.env.R2_ACCOUNT_ID &&
        process.env.R2_ACCESS_KEY_ID &&
        process.env.R2_SECRET_ACCESS_KEY &&
        process.env.R2_BUCKET_NAME,
    ),
    timestamp: new Date().toISOString(),
  });
}
