import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import {
  getR2PublicBaseUrl,
  isR2Configured,
  objectKeyFromPublicUrl,
  r2DeleteObject,
  r2PutObject,
} from "@/lib/r2";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_DOC_BYTES = 10 * 1024 * 1024; // 10 MB (matches serverActions bodySizeLimit)

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

const DOC_TYPES = new Set([
  ...IMAGE_TYPES,
  "application/pdf",
  // some phones/scanners report empty or generic types
  "application/octet-stream",
]);

function extFromType(type: string, originalName: string): string {
  const fromName = path.extname(originalName).replace(/^\./, "").toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;

  if (type === "application/pdf") return "pdf";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  if (type === "image/heic" || type === "image/heif") return "heic";
  return "jpg";
}

function contentTypeFor(file: File, ext: string): string {
  const t = (file.type || "").toLowerCase();
  if (t && t !== "application/octet-stream") return t;
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  if (ext === "heic" || ext === "heif") return "image/heic";
  return "image/jpeg";
}

function validateFile(
  file: File,
  maxBytes: number,
  allowed: Set<string>,
  kindLabel: string,
): { type: string; ext: string; isImage: boolean; isPdf: boolean } {
  if (!file || file.size === 0) {
    throw new Error("No file uploaded");
  }
  if (file.size > maxBytes) {
    throw new Error(
      `File must be ${Math.round(maxBytes / (1024 * 1024))} MB or smaller`,
    );
  }

  const type = (file.type || "application/octet-stream").toLowerCase();
  const isImage = type.startsWith("image/");
  const isPdf =
    type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (!allowed.has(type) && !isImage && !isPdf) {
    throw new Error(`Only ${kindLabel} are allowed`);
  }

  const ext = extFromType(type, file.name || "");
  return { type, ext, isImage, isPdf };
}

/**
 * Upload to Cloudflare R2 when credentials are set; otherwise local public/uploads (dev).
 * Public URLs always use https://images.mcneelyfamilypoodles.com when using R2.
 */
async function writeUpload(
  file: File,
  folder: string,
  maxBytes: number,
  allowed: Set<string>,
  kindLabel: string,
): Promise<{ url: string; absolutePath: string }> {
  const { ext } = validateFile(file, maxBytes, allowed, kindLabel);
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  // Normalize folder: "medical/id" → "uploads/medical/id/name"
  const key = `uploads/${folder.replace(/^\/+|\/+$/g, "")}/${name}`.replace(
    /\\/g,
    "/",
  );
  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = contentTypeFor(file, ext);

  if (isR2Configured()) {
    const { publicUrl } = await r2PutObject({
      key,
      body: buffer,
      contentType,
    });
    return { url: publicUrl, absolutePath: "" };
  }

  // Local fallback when R2 env is not set (offline / early dev)
  const relDir = path.join("uploads", folder);
  const absDir = path.join(process.cwd(), "public", relDir);
  await mkdir(absDir, { recursive: true });
  const absPath = path.join(absDir, name);
  await writeFile(absPath, buffer);

  return {
    url: `/${relDir.replace(/\\/g, "/")}/${name}`,
    absolutePath: absPath,
  };
}

/**
 * Save an uploaded image (hero/gallery/CMS). Uses R2 public CDN when configured.
 */
export async function saveUploadedImage(
  file: File,
  folder: string,
): Promise<{ url: string; absolutePath: string }> {
  return writeUpload(
    file,
    folder,
    MAX_IMAGE_BYTES,
    IMAGE_TYPES,
    "image files",
  );
}

/**
 * Medical / admin documents: PDF or scanned images.
 * Stored on R2 with the same public base when configured (protect sensitive docs
 * with R2 private buckets + signed URLs in a future hardening pass if needed).
 */
export async function saveUploadedDocument(
  file: File,
  folder: string,
): Promise<{ url: string; absolutePath: string }> {
  return writeUpload(
    file,
    folder,
    MAX_DOC_BYTES,
    DOC_TYPES,
    "PDF or image scans",
  );
}

export function isPdfUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.endsWith(".pdf") || lower.includes(".pdf?") || lower.includes("/pdf");
}

export function isImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (/\.(jpe?g|png|webp|gif|heic|heif)(\?|$)/i.test(url)) return true;
  // R2 custom domain images without relying only on extension
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host === "images.mcneelyfamilypoodles.com") return true;
    if (host === new URL(getR2PublicBaseUrl()).hostname.toLowerCase()) {
      return !isPdfUrl(url);
    }
  } catch {
    /* relative /uploads paths */
  }
  return url.startsWith("/uploads/");
}

/**
 * Delete an uploaded file from R2 and/or local public disk (best-effort).
 * Callers may still pass the historical name deleteLocalUpload.
 */
export async function deleteUpload(url: string) {
  if (!url) return;

  const key = objectKeyFromPublicUrl(url);
  if (key && isR2Configured()) {
    await r2DeleteObject(key);
  }

  // Local public path cleanup
  const localPath = url.startsWith("/uploads/")
    ? url
    : key && !url.startsWith("http")
      ? `/${key}`
      : null;

  if (localPath?.startsWith("/uploads/")) {
    const abs = path.join(process.cwd(), "public", localPath.replace(/^\//, ""));
    try {
      await unlink(abs);
    } catch {
      // ignore missing files
    }
  }
}

/** @deprecated Use deleteUpload — kept for existing admin action imports */
export async function deleteLocalUpload(url: string) {
  return deleteUpload(url);
}

/** Base URL for images when using R2 (for docs / UI hints). */
export function mediaPublicBaseUrl(): string {
  return isR2Configured()
    ? getR2PublicBaseUrl()
    : "(local /uploads — set R2_* env to use https://images.mcneelyfamilypoodles.com)";
}
