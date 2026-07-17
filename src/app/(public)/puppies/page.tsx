import Link from "next/link";
import { PuppyCard } from "@/components/inventory/puppy-card";
import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "Puppies",
  description:
    "Browse puppies by litter. Each puppy links back to sire and dam.",
};

/** Active inventory only — adopted puppies are listed on /alumni */
const activePuppyWhere = {
  isPublished: true,
  isAdopted: false,
} as const;

export default async function PuppiesPage() {
  const litters = await db.litter.findMany({
    where: {
      isPublished: true,
      puppies: { some: activePuppyWhere },
    },
    orderBy: { birthDate: "desc" },
    include: {
      dam: { select: { slug: true, name: true } },
      sire: { select: { slug: true, name: true } },
      puppies: {
        where: activePuppyWhere,
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: {
          photos: {
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
          },
        },
      },
    },
  });

  const unassigned = await db.puppy.findMany({
    where: { ...activePuppyWhere, litterId: null },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      photos: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        take: 1,
      },
    },
  });

  const hasAny = litters.length > 0 || unassigned.length > 0;

  return (
    <>
      <PageHero
        title="Puppies"
        subtitle="Organized by litter"
      />
      <SectionShell>
        {!hasAny ? (
          <p className="mx-auto max-w-2xl text-center text-gray-500">
            No puppies are available right now. Check back soon, browse{" "}
            <Link
              href="/alumni"
              className="text-gray-700 underline-offset-2 hover:text-black hover:underline"
            >
              Alumni
            </Link>
            , or{" "}
            <Link
              href="/apply"
              className="text-gray-700 underline-offset-2 hover:text-black hover:underline"
            >
              submit an application
            </Link>{" "}
            to join the waitlist.
          </p>
        ) : (
          <div className="space-y-14">
            {litters.map((litter) => (
              <section key={litter.id}>
                <div className="mb-6 border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-semibold text-black">
                    {litter.name ?? "Litter"}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Born {formatDate(litter.birthDate)}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Dam:{" "}
                    <Link
                      href={`/parents/${litter.dam.slug}`}
                      className="text-gray-700 underline-offset-2 hover:text-black hover:underline"
                    >
                      {litter.dam.name}
                    </Link>
                    {" · "}
                    Sire:{" "}
                    <Link
                      href={`/parents/${litter.sire.slug}`}
                      className="text-gray-700 underline-offset-2 hover:text-black hover:underline"
                    >
                      {litter.sire.name}
                    </Link>
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {litter.puppies.map((puppy) => (
                    <PuppyCard key={puppy.id} puppy={puppy} />
                  ))}
                </div>
              </section>
            ))}

            {unassigned.length > 0 ? (
              <section>
                <div className="mb-6 border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-semibold text-black">
                    Other puppies
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {unassigned.map((puppy) => (
                    <PuppyCard key={puppy.id} puppy={puppy} />
                  ))}
                </div>
              </section>
            ) : null}

            <p className="text-center text-sm text-gray-500">
              Looking for past placements?{" "}
              <Link
                href="/alumni"
                className="text-gray-700 underline-offset-2 hover:text-black hover:underline"
              >
                Visit Alumni →
              </Link>
            </p>
          </div>
        )}
      </SectionShell>
    </>
  );
}
