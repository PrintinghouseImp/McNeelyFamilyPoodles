import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

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

async function writeUpload(
  file: File,
  folder: string,
  maxBytes: number,
  allowed: Set<string>,
  kindLabel: string,
): Promise<{ url: string; absolutePath: string }> {
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
    type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");

  if (!allowed.has(type) && !isImage && !isPdf) {
    throw new Error(`Only ${kindLabel} are allowed`);
  }

  const ext = extFromType(type, file.name || "");
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const relDir = path.join("uploads", folder);
  const absDir = path.join(process.cwd(), "public", relDir);
  await mkdir(absDir, { recursive: true });

  const absPath = path.join(absDir, name);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absPath, buffer);

  return {
    url: `/${relDir.replace(/\\/g, "/")}/${name}`,
    absolutePath: absPath,
  };
}

/**
 * Save an uploaded image under public/uploads for local/dev use.
 * Production can swap this for S3/R2 later without changing callers.
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
 * Medical / admin documents: PDF or scanned images (JPEG, PNG, WebP, HEIC, etc.).
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
  return url.toLowerCase().endsWith(".pdf") || url.includes("/pdf");
}

export function isImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(url);
}

/** Best-effort delete of a local public upload. */
export async function deleteLocalUpload(url: string) {
  if (!url.startsWith("/uploads/")) return;
  const abs = path.join(process.cwd(), "public", url.replace(/^\//, ""));
  try {
    await unlink(abs);
  } catch {
    // ignore missing files
  }
}
