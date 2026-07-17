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
  note: string | null;
  photos: AlumniPhoto[];
};

/** Showcase card for Alumni: primary photo, color, short note. */
export function AlumniDogCard({
  href,
  name,
  badge,
  sexLabel,
  color,
  note,
  photos,
}: AlumniDogCardProps) {
  const ordered = [...photos].sort((a, b) => {
    if (a.isPrimary === b.isPrimary) return 0;
    return a.isPrimary ? -1 : 1;
  });
  const hero = ordered[0] ?? null;

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-gray-300">
      <div className="grid gap-0 md:grid-cols-2">
        <div className="border-b border-gray-100 md:border-b-0 md:border-r">
          {hero ? (
            <PhotoFrame src={hero.url} alt={hero.alt ?? name} />
          ) : (
            <PhotoPlaceholder label={name} />
          )}
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
              <p className="mt-1 text-sm text-gray-500">{sexLabel}</p>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-gray-600 ring-1 ring-inset ring-gray-200">
              {badge}
            </span>
          </div>

          {color ? (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Color
              </p>
              <p className="mt-1.5 text-sm text-gray-700">{color}</p>
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

export { formatSex };
