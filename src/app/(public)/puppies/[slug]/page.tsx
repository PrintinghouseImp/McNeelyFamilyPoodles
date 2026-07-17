import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PhotoFrame } from "@/components/inventory/photo-frame";
import { PhotoPlaceholder } from "@/components/inventory/photo-placeholder";
import { StatusBadge } from "@/components/inventory/status-badge";
import { ViewGeneticsButton } from "@/components/inventory/view-genetics-button";
import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";
import { db } from "@/lib/db";
import {
  formatDate,
  formatPuppyPrice,
  formatSex,
} from "@/lib/format";
import { SITE } from "@/lib/constants";

type Props = { params: Promise<{ slug: string }> };

async function getPuppy(slug: string) {
  return db.puppy.findFirst({
    where: { slug, isPublished: true },
    include: {
      photos: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
      litter: {
        include: {
          dam: true,
          sire: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const puppy = await db.puppy.findFirst({
    where: { slug, isPublished: true },
    select: { name: true, color: true, sex: true, description: true },
  });
  if (!puppy) return { title: "Puppy not found" };

  const bits = [puppy.name, formatSex(puppy.sex), puppy.color].filter(Boolean);
  return {
    title: puppy.name,
    description:
      puppy.description?.slice(0, 160) ||
      `${bits.join(" · ")} — ${SITE.name}.`,
  };
}

export default async function PuppyDetailPage({ params }: Props) {
  const { slug } = await params;
  const puppy = await getPuppy(slug);
  if (!puppy) notFound();

  const primary =
    puppy.photos.find((p) => p.isPrimary) ?? puppy.photos[0] ?? null;
  const gallery = puppy.photos.filter((p) => p.id !== primary?.id);
  const price = formatPuppyPrice(puppy.priceCents, puppy.priceLabel);
  const birthDate = formatDate(puppy.birthDate ?? puppy.litter?.birthDate);

  const specs = [
    { label: "Sex", value: formatSex(puppy.sex) },
    puppy.color ? { label: "Color", value: puppy.color } : null,
    birthDate ? { label: "Born", value: birthDate } : null,
    price ? { label: "Price", value: price } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const canApply =
    !puppy.isAdopted &&
    (puppy.status === "AVAILABLE" || puppy.status === "GUARDIANSHIP");

  return (
    <>
      <PageHero
        title={puppy.name}
        subtitle={[formatSex(puppy.sex), puppy.color]
          .filter(Boolean)
          .join(" · ")}
      />
      <SectionShell>
        <div className="mb-8">
          <Link
            href="/puppies"
            className="text-sm text-gray-500 transition hover:text-black"
          >
            ← All puppies
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {primary ? (
              <PhotoFrame
                src={primary.url}
                alt={primary.alt ?? puppy.name}
              />
            ) : (
              <PhotoPlaceholder label={puppy.name} />
            )}
          </div>

          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {puppy.isAdopted ? (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-gray-600 ring-1 ring-inset ring-gray-200">
                  Adopted · Alumni
                </span>
              ) : (
                <StatusBadge status={puppy.status} />
              )}
            </div>

            <dl className="grid grid-cols-2 gap-3">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="rounded-xl border border-gray-200 bg-white p-3"
                >
                  <dt className="text-xs uppercase tracking-wide text-gray-400">
                    {spec.label}
                  </dt>
                  <dd className="mt-1 font-medium text-black">{spec.value}</dd>
                </div>
              ))}
            </dl>

            {puppy.litter ? (
              <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Parents
                </h2>
                <p className="mt-3 text-sm text-gray-600">
                  Dam:{" "}
                  <Link
                    href={`/parents/${puppy.litter.dam.slug}`}
                    className="text-gray-700 underline-offset-2 hover:text-black hover:underline"
                  >
                    {puppy.litter.dam.name}
                  </Link>
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Sire:{" "}
                  <Link
                    href={`/parents/${puppy.litter.sire.slug}`}
                    className="text-gray-700 underline-offset-2 hover:text-black hover:underline"
                  >
                    {puppy.litter.sire.name}
                  </Link>
                </p>
              </div>
            ) : null}

            {puppy.description ? (
              <div className="mt-6">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  About
                </h2>
                <p className="mt-2 whitespace-pre-wrap text-gray-700">
                  {puppy.description}
                </p>
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {canApply ? (
                <Link
                  href={`/apply?puppy=${puppy.slug}`}
                  className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-900"
                >
                  Apply for {puppy.name}
                </Link>
              ) : null}
              {canApply ? (
                <Link
                  href={`/portal/deposits/new?puppy=${puppy.slug}`}
                  className="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-black"
                >
                  Request deposit
                </Link>
              ) : null}
              <ViewGeneticsButton
                dogName={puppy.name}
                geneticsData={puppy.geneticsData}
                geneticsText={
                  puppy.genetics ||
                  [
                    puppy.litter?.dam.genetics,
                    puppy.litter?.sire.genetics,
                  ]
                    .filter(Boolean)
                    .join(" · ") ||
                  null
                }
              />
            </div>
          </div>
        </div>

        {gallery.length > 0 ? (
          <section className="mt-14">
            <h2 className="mb-6 text-xl font-semibold text-black">Gallery</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {gallery.map((photo) => (
                <PhotoFrame
                  key={photo.id}
                  src={photo.url}
                  alt={photo.alt ?? puppy.name}
                  className="rounded-xl"
                />
              ))}
            </div>
          </section>
        ) : null}
      </SectionShell>
    </>
  );
}
