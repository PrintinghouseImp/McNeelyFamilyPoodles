import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PhotoFrame } from "@/components/inventory/photo-frame";
import { PhotoPlaceholder } from "@/components/inventory/photo-placeholder";
import { PuppyCard } from "@/components/inventory/puppy-card";
import { ViewGeneticsButton } from "@/components/inventory/view-genetics-button";
import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";
import { db } from "@/lib/db";
import { formatDate, formatSex } from "@/lib/format";
import { SITE } from "@/lib/constants";

type Props = { params: Promise<{ slug: string }> };

async function getParent(slug: string) {
  return db.parentDog.findFirst({
    where: { slug, isPublished: true },
    include: {
      photos: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
      littersAsDam: {
        where: { isPublished: true },
        orderBy: { birthDate: "desc" },
        include: {
          sire: true,
          puppies: {
            where: { isPublished: true },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
            include: {
              photos: {
                orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
                take: 1,
              },
            },
          },
        },
      },
      littersAsSire: {
        where: { isPublished: true },
        orderBy: { birthDate: "desc" },
        include: {
          dam: true,
          puppies: {
            where: { isPublished: true },
            orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
            include: {
              photos: {
                orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
                take: 1,
              },
            },
          },
        },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const parent = await db.parentDog.findFirst({
    where: { slug, isPublished: true },
    select: { name: true, color: true, sex: true, description: true },
  });
  if (!parent) return { title: "Parent not found" };

  const role = parent.sex === "MALE" ? "Sire" : "Dam";
  const bits = [parent.name, role, parent.color].filter(Boolean);
  return {
    title: parent.name,
    description:
      parent.description?.slice(0, 160) ||
      `${bits.join(" · ")} at ${SITE.name}.`,
  };
}

export default async function ParentDetailPage({ params }: Props) {
  const { slug } = await params;
  const parent = await getParent(slug);
  if (!parent) notFound();

  const primary =
    parent.photos.find((p) => p.isPrimary) ?? parent.photos[0] ?? null;
  const gallery = parent.photos.filter((p) => p.id !== primary?.id);
  const litters = [
    ...parent.littersAsDam.map((l) => ({
      ...l,
      role: "dam" as const,
      mate: l.sire,
    })),
    ...parent.littersAsSire.map((l) => ({
      ...l,
      role: "sire" as const,
      mate: l.dam,
    })),
  ].sort(
    (a, b) =>
      new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime(),
  );

  const roleLabel = parent.sex === "MALE" ? "Sire" : "Dam";
  const specs = [
    { label: "Sex", value: formatSex(parent.sex) },
    { label: "Role", value: roleLabel },
    parent.color ? { label: "Color", value: parent.color } : null,
    parent.weightLbs != null
      ? { label: "Weight", value: `${parent.weightLbs} lbs` }
      : null,
    parent.heightInches != null
      ? { label: "Height", value: `${parent.heightInches}"` }
      : null,
    parent.isRetired ? { label: "Status", value: "Retired" } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <>
      <PageHero
        title={parent.name}
        subtitle={[roleLabel, parent.color].filter(Boolean).join(" · ")}
      />
      <SectionShell>
        <div className="mb-8">
          <Link
            href="/parents"
            className="text-sm text-gray-500 transition hover:text-black"
          >
            ← All sires & dams
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {primary ? (
              <PhotoFrame
                src={primary.url}
                alt={primary.alt ?? parent.name}
              />
            ) : (
              <PhotoPlaceholder label={parent.name} />
            )}
          </div>

          <div>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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

            {parent.description ? (
              <div className="mt-6">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  About
                </h2>
                <p className="mt-2 whitespace-pre-wrap text-gray-700">
                  {parent.description}
                </p>
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ViewGeneticsButton
                dogName={parent.name}
                geneticsData={parent.geneticsData}
                geneticsText={parent.genetics}
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
                  alt={photo.alt ?? parent.name}
                  className="rounded-xl"
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-14">
          <h2 className="mb-6 text-xl font-semibold text-black">Litters</h2>
          {litters.length === 0 ? (
            <p className="text-gray-500">No published litters yet.</p>
          ) : (
            <div className="space-y-12">
              {litters.map((litter) => (
                <div
                  key={litter.id}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-6"
                >
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="text-lg font-semibold text-black">
                      {litter.name ?? "Litter"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Born {formatDate(litter.birthDate)}
                    </p>
                  </div>
                  <p className="mb-6 text-sm text-gray-600">
                    {litter.role === "dam" ? "Sire" : "Dam"}:{" "}
                    <Link
                      href={`/parents/${litter.mate.slug}`}
                      className="text-gray-700 underline-offset-2 hover:text-black hover:underline"
                    >
                      {litter.mate.name}
                    </Link>
                  </p>
                  {litter.puppies.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No published puppies in this litter.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {litter.puppies.map((puppy) => (
                        <PuppyCard key={puppy.id} puppy={puppy} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </SectionShell>
    </>
  );
}
