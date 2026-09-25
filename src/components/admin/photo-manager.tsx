import { deletePhoto, setPrimaryPhoto } from "@/app/admin/actions/photos";
import { PhotoUploadForm } from "@/components/admin/photo-upload-form";
import { btnDanger, btnSecondary } from "@/components/admin/field";
import { PhotoFrame } from "@/components/inventory/photo-frame";

type PhotoRow = {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
};

export function PhotoManager({
  entityType,
  entityId,
  photos,
}: {
  entityType: "PARENT" | "PUPPY" | "LITTER";
  entityId: string;
  photos: PhotoRow[];
}) {
  return (
    <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-black">Photos</h2>
      <p className="mt-1 text-sm text-gray-500">
        Upload from your phone camera or gallery. Mark one as the hero shot for
        cards.
      </p>

      <PhotoUploadForm entityType={entityType} entityId={entityId} />

      {photos.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">No photos yet.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <li
              key={photo.id}
              className="overflow-hidden rounded-xl border border-gray-200"
            >
              <PhotoFrame
                src={photo.url}
                alt={photo.alt ?? "Dog photo"}
              />
              <div className="space-y-2 p-3">
                <p className="text-xs text-gray-500">
                  {photo.isPrimary ? "Hero photo" : "Gallery"}
                  {photo.alt ? ` · ${photo.alt}` : null}
                </p>
                <div className="flex flex-wrap gap-2">
                  {!photo.isPrimary ? (
                    <form action={setPrimaryPhoto}>
                      <input type="hidden" name="photoId" value={photo.id} />
                      <button type="submit" className={btnSecondary}>
                        Set hero
                      </button>
                    </form>
                  ) : null}
                  <form action={deletePhoto}>
                    <input type="hidden" name="photoId" value={photo.id} />
                    <button type="submit" className={btnDanger}>
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
