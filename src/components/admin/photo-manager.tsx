import {
  deletePhoto,
  setPrimaryPhoto,
  uploadPhoto,
} from "@/app/admin/actions/photos";
import {
  btnDanger,
  btnPrimary,
  btnSecondary,
  checkClass,
  inputClass,
} from "@/components/admin/field";
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

      <form action={uploadPhoto} className="mt-6 space-y-4 border-b border-gray-100 pb-6">
        <input type="hidden" name="entityType" value={entityType} />
        <input type="hidden" name="entityId" value={entityId} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Add photo
          </label>
          <input
            type="file"
            name="file"
            accept="image/*"
            capture="environment"
            required
            className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-gray-200"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Alt text (optional)
          </label>
          <input
            type="text"
            name="alt"
            className={inputClass}
            placeholder="Describe the photo"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="isPrimary" className={checkClass} />
          Set as hero photo
        </label>
        <button type="submit" className={btnPrimary}>
          Upload photo
        </button>
      </form>

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
