import { isImageUrl, isPdfUrl } from "@/lib/uploads";
import { PhotoFrame } from "@/components/inventory/photo-frame";

export function MedicalFilePreview({
  fileUrl,
  title,
}: {
  fileUrl: string;
  title: string;
}) {
  if (isPdfUrl(fileUrl)) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <p className="text-sm font-medium text-black">{title}</p>
        <p className="mt-1 text-sm text-gray-500">PDF document</p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-black"
        >
          Open PDF →
        </a>
      </div>
    );
  }

  if (isImageUrl(fileUrl) || fileUrl.startsWith("/uploads/")) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <PhotoFrame src={fileUrl} alt={title} />
        <div className="border-t border-gray-100 px-4 py-3">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-black"
          >
            Open full size →
          </a>
        </div>
      </div>
    );
  }

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-gray-700 underline"
    >
      View attached file
    </a>
  );
}
