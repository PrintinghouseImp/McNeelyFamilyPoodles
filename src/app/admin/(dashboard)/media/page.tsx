import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { deletePhoto, setPrimaryPhoto } from "@/app/admin/actions/photos";
import { btnDanger, btnSecondary } from "@/components/admin/field";
import { PhotoFrame } from "@/components/inventory/photo-frame";
import { MEDIA_CDN } from "@/lib/constants";
import { isR2Configured, getR2PublicBaseUrl } from "@/lib/r2";

export const metadata = { title: "Admin · Media" };

export default async function AdminMediaPage() {
  await requireAdmin();

  const photos = await db.photo.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      parentDog: { select: { id: true, name: true } },
      puppy: { select: { id: true, name: true } },
      litter: { select: { id: true, name: true, slug: true } },
    },
  });

  const r2Ready = isR2Configured();
  const publicBase = r2Ready ? getR2PublicBaseUrl() : MEDIA_CDN.publicUrl;

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-black">
        Media library
      </h1>
      <p className="mt-1 text-gray-500">
        All uploaded photos. Prefer uploading from a dog or litter edit page
        (supports phone camera).
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Storage:{" "}
        {r2Ready ? (
          <>
            Cloudflare R2 · public CDN{" "}
            <a
              href={publicBase}
              className="font-medium text-black underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {publicBase}
            </a>
          </>
        ) : (
          <>
            local <code className="text-xs">public/uploads</code> (set{" "}
            <code className="text-xs">R2_*</code> env vars to use{" "}
            {MEDIA_CDN.publicUrl})
          </>
        )}
      </p>

      {photos.length === 0 ? (
        <p className="mt-8 text-gray-500">No photos uploaded yet.</p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => {
            const target = photo.parentDog
              ? {
                  label: `Parent · ${photo.parentDog.name}`,
                  href: `/admin/parents/${photo.parentDog.id}`,
                }
              : photo.puppy
                ? {
                    label: `Puppy · ${photo.puppy.name}`,
                    href: `/admin/puppies/${photo.puppy.id}`,
                  }
                : photo.litter
                  ? {
                      label: `Litter · ${photo.litter.name ?? photo.litter.slug}`,
                      href: `/admin/litters/${photo.litter.id}`,
                    }
                  : { label: photo.entityType, href: null };

            return (
              <li
                key={photo.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
              >
                <PhotoFrame
                  src={photo.url}
                  alt={photo.alt ?? "Upload"}
                />
                <div className="space-y-2 p-4 text-sm">
                  {target.href ? (
                    <Link
                      href={target.href}
                      className="font-medium text-black hover:underline"
                    >
                      {target.label}
                    </Link>
                  ) : (
                    <p className="font-medium text-black">{target.label}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {photo.isPrimary ? "Hero" : "Gallery"}
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
            );
          })}
        </ul>
      )}
    </div>
  );
}
