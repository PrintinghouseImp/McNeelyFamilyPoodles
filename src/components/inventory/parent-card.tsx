import Link from "next/link";
import type { Sex } from "@/generated/prisma/client";
import { PhotoPlaceholder } from "@/components/inventory/photo-placeholder";
import { formatSex } from "@/lib/format";

export type ParentCardData = {
  slug: string;
  name: string;
  sex: Sex;
  color: string | null;
  isRetired: boolean;
  photos?: { url: string; alt: string | null; isPrimary: boolean }[];
};

type ParentCardProps = {
  parent: ParentCardData;
};

export function ParentCard({ parent }: ParentCardProps) {
  const primary =
    parent.photos?.find((p) => p.isPrimary) ?? parent.photos?.[0] ?? null;

  return (
    <Link
      href={`/parents/${parent.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-sm"
    >
      {primary ? (
        // eslint-disable-next-line @next/next/no-img-element -- external URLs until image host is configured
        <img
          src={primary.url}
          alt={primary.alt ?? parent.name}
          className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.01]"
        />
      ) : (
        <PhotoPlaceholder label={parent.name} />
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-semibold text-black">{parent.name}</h3>
          {parent.isRetired ? (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-gray-500 ring-1 ring-inset ring-gray-200">
              Retired
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-gray-600 ring-1 ring-inset ring-gray-200">
              {parent.sex === "MALE" ? "Sire" : "Dam"}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {formatSex(parent.sex)}
          {parent.color ? ` · ${parent.color}` : null}
        </p>
      </div>
    </Link>
  );
}
