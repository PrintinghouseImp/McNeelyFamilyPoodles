import Link from "next/link";
import { PhotoFrame } from "@/components/inventory/photo-frame";
import { PhotoPlaceholder } from "@/components/inventory/photo-placeholder";
import { formatSex } from "@/lib/format";

export type AlumniPhoto = {
  url: string;
  alt: string | null;
  isPrimary: boolean;
};

export type AlumniDogCardProps = {
  href: string;
  name: string;
  badge: string;
  sexLabel: string;
  color: string | null;
  genetics: string | null;
  healthMarkers: string[];
  note: string | null;
  photos: AlumniPhoto[];
};

/** Showcase card for Alumni: gallery (up to 6), genetics, health markers, short note. */
export function AlumniDogCard({
  href,
  name,
  badge,
  sexLabel,
  color,
  genetics,
  healthMarkers,
  note,
  photos,
}: AlumniDogCardProps) {
  const ordered = [...photos].sort((a, b) => {
    if (a.isPrimary === b.isPrimary) return 0;
    return a.isPrimary ? -1 : 1;
  });
  const gallery = ordered.slice(0, 6);
  const hero = gallery[0] ?? null;
  const rest = gallery.slice(1);

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-gray-300">
      <div className="grid gap-0 md:grid-cols-2">
        <div className="border-b border-gray-100 md:border-b-0 md:border-r">
          {hero ? (
            <PhotoFrame src={hero.url} alt={hero.alt ?? name} />
          ) : (
            <PhotoPlaceholder label={name} />
          )}
          {rest.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 border-t border-gray-100 p-1 sm:grid-cols-5">
              {rest.map((photo, i) => (
                <div
                  key={`${photo.url}-${i}`}
                  className="overflow-hidden rounded-lg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.alt ?? `${name} photo ${i + 2}`}
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight text-black">
                <Link
                  href={href}
                  className="transition hover:underline hover:underline-offset-2"
                >
                  {name}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {sexLabel}
                {color ? ` · ${color}` : null}
              </p>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-gray-600 ring-1 ring-inset ring-gray-200">
              {badge}
            </span>
          </div>

          {genetics ? (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Color genetics
              </p>
              <p className="mt-1.5 font-mono text-sm leading-relaxed text-gray-700">
                {genetics}
              </p>
            </div>
          ) : color ? (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Color genetics
              </p>
              <p className="mt-1.5 text-sm text-gray-700">{color}</p>
            </div>
          ) : null}

          {healthMarkers.length > 0 ? (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Health markers
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {healthMarkers.map((marker) => (
                  <li
                    key={marker}
                    className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700"
                  >
                    {marker}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {note ? (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Note
              </p>
              <p className="mt-1.5 line-clamp-4 text-sm leading-relaxed text-gray-600">
                {note}
              </p>
            </div>
          ) : null}

          <div className="mt-auto pt-6">
            <Link
              href={href}
              className="text-sm font-medium text-gray-700 underline-offset-2 transition hover:text-black hover:underline"
            >
              View full profile →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function buildHealthMarkers(opts: {
  genetics?: string | null;
  weightLbs?: number | null;
  heightInches?: number | null;
  isParent?: boolean;
}): string[] {
  const markers: string[] = [];
  if (opts.genetics?.trim()) {
    markers.push("Genetic panel on file");
  }
  if (opts.isParent) {
    markers.push("Breeding program · annual vet care");
  } else {
    markers.push("Home-raised · vet-checked");
  }
  if (opts.weightLbs != null) {
    markers.push(`${opts.weightLbs} lbs`);
  }
  if (opts.heightInches != null) {
    markers.push(`${opts.heightInches}"`);
  }
  return markers;
}

export { formatSex };
