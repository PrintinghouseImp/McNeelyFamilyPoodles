import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

/** Public CDN / custom domain for all R2 objects */
export const R2_PUBLIC_URL_DEFAULT = "https://images.mcneelyfamilypoodles.com";

export function getR2PublicBaseUrl(): string {
  const raw =
    process.env.R2_PUBLIC_URL?.trim() ||
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim() ||
    R2_PUBLIC_URL_DEFAULT;
  return raw.replace(/\/$/, "");
}

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID?.trim() &&
      process.env.R2_ACCESS_KEY_ID?.trim() &&
      process.env.R2_SECRET_ACCESS_KEY?.trim() &&
      process.env.R2_BUCKET_NAME?.trim(),
  );
}

export function isR2PublicUrl(url: string): boolean {
  if (!url.startsWith("http://") && !url.startsWith("https://")) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    const publicHost = new URL(getR2PublicBaseUrl()).hostname.toLowerCase();
    if (host === publicHost) return true;
    // also accept r2.dev / cloudflarestorage URLs if used before custom domain
    return (
      host.endsWith(".r2.dev") ||
      host.endsWith(".r2.cloudflarestorage.com")
    );
  } catch {
    return false;
  }
}

/** Object key from a public URL on our image CDN (or local /uploads path). */
export function objectKeyFromPublicUrl(url: string): string | null {
  if (url.startsWith("/uploads/")) {
    return url.replace(/^\//, "");
  }
  try {
    const u = new URL(url);
    const base = getR2PublicBaseUrl();
    const baseHost = new URL(base).hostname.toLowerCase();
    if (u.hostname.toLowerCase() === baseHost) {
      return u.pathname.replace(/^\//, "") || null;
    }
    // path-style or virtual-hosted R2 URLs — use pathname without leading slash
    if (
      u.hostname.endsWith(".r2.dev") ||
      u.hostname.endsWith(".r2.cloudflarestorage.com")
    ) {
      return u.pathname.replace(/^\//, "") || null;
    }
  } catch {
    return null;
  }
  return null;
}

let client: S3Client | null = null;

function getClient(): S3Client {
  if (client) return client;

  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Cloudflare R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.",
    );
  }

  const endpoint =
    process.env.R2_ENDPOINT?.trim() ||
    `https://${accountId}.r2.cloudflarestorage.com`;

  client = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return client;
}

export async function r2PutObject(params: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<{ key: string; publicUrl: string }> {
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  if (!bucket) {
    throw new Error("R2_BUCKET_NAME is not set");
  }

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      // Public read is normally via custom domain + bucket public access settings.
      // Cache for CDN edge.
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  const publicUrl = `${getR2PublicBaseUrl()}/${params.key}`;
  return { key: params.key, publicUrl };
}

export async function r2DeleteObject(key: string): Promise<void> {
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  if (!bucket || !isR2Configured()) return;

  try {
    await getClient().send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
  } catch {
    // best-effort delete
  }
}
