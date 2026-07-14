import Link from "next/link";
import type { PuppyStatus, Sex } from "@/generated/prisma/client";
import { PhotoPlaceholder } from "@/components/inventory/photo-placeholder";
import { StatusBadge } from "@/components/inventory/status-badge";
import { formatPuppyPrice, formatSex } from "@/lib/format";

export type PuppyCardData = {
  slug: string;
  name: string;
  sex: Sex;
  color: string | null;
  status: PuppyStatus;
  priceCents: number | null;
  priceLabel: string | null;
  photos?: { url: string; alt: string | null; isPrimary: boolean }[];
};

type PuppyCardProps = {
  puppy: PuppyCardData;
};

export function PuppyCard({ puppy }: PuppyCardProps) {
  const primary =
    puppy.photos?.find((p) => p.isPrimary) ?? puppy.photos?.[0] ?? null;
  const price = formatPuppyPrice(puppy.priceCents, puppy.priceLabel);

  return (
    <Link
      href={`/puppies/${puppy.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-sm"
    >
      {primary ? (
        // eslint-disable-next-line @next/next/no-img-element -- external URLs until image host is configured
        <img
          src={primary.url}
          alt={primary.alt ?? puppy.name}
          className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.01]"
        />
      ) : (
        <PhotoPlaceholder label={puppy.name} />
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xl font-semibold text-black group-hover:text-black">
            {puppy.name}
          </h3>
          <StatusBadge status={puppy.status} />
        </div>
        <p className="text-sm text-gray-500">
          {formatSex(puppy.sex)}
          {puppy.color ? ` · ${puppy.color}` : null}
        </p>
        {price ? (
          <p className="mt-auto text-sm font-medium text-gray-700">{price}</p>
        ) : null}
      </div>
    </Link>
  );
}
