import { NextResponse } from "next/server";
import { authorizeMedicalDownload } from "@/lib/vault";
import { readStoredUpload } from "@/lib/uploads";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Props = { params: Promise<{ id: string }> };

function attachmentName(title: string, contentType: string): string {
  const ext =
    contentType === "application/pdf"
      ? "pdf"
      : contentType === "image/png"
        ? "png"
        : contentType === "image/webp"
          ? "webp"
          : contentType === "image/gif"
            ? "gif"
            : contentType === "image/heic"
              ? "heic"
              : contentType === "image/jpeg"
                ? "jpg"
                : "bin";
  const base =
    title
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "record";
  return `${base}.${ext}`;
}

/** Authenticated medical file. The response body is the file, never a CDN redirect. */
export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;
  const access = await authorizeMedicalDownload(id);
  if (!access.ok) {
    return NextResponse.json(
      { error: access.status === 401 ? "Sign in required" : "Not found" },
      { status: access.status },
    );
  }

  const file = await readStoredUpload(access.record.fileUrl);
  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filename = attachmentName(access.record.title, file.contentType);
  return new NextResponse(new Uint8Array(file.body), {
    status: 200,
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
