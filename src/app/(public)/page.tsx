import Link from "next/link";
import { PuppyCard } from "@/components/inventory/puppy-card";
import { SectionShell } from "@/components/ui/section-shell";
import { SITE } from "@/lib/constants";
import { db } from "@/lib/db";

export default async function HomePage() {
  // Three most recently born available puppies
  const available = await db.puppy.findMany({
    where: {
      isPublished: true,
      isAdopted: false,
      status: { in: ["AVAILABLE", "GUARDIANSHIP"] },
    },
    orderBy: [
      { birthDate: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ],
    take: 3,
    include: {
      photos: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        take: 1,
      },
    },
  });

  return (
    <>
      <header className="flex flex-1 items-center justify-center bg-white py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="mb-5 text-4xl font-semibold tracking-tight text-black md:text-6xl">
            {SITE.name}
          </h1>
          <p className="mb-10 text-lg text-gray-500 md:text-2xl">
            {SITE.tagline}
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/puppies"
              className="inline-block rounded-full bg-black px-8 py-3.5 text-base font-medium text-white transition hover:bg-gray-900"
            >
              View available puppies
            </Link>
            <Link
              href="/parents"
              className="inline-block rounded-full border border-gray-300 bg-white px-8 py-3.5 text-base font-medium text-gray-700 transition hover:border-gray-400 hover:text-black"
            >
              Meet sires & dams
            </Link>
          </div>
        </div>
      </header>

      <section className="border-y border-gray-200 bg-gray-50 py-12">
        <div className="container mx-auto grid grid-cols-1 gap-10 px-6 text-center md:grid-cols-3">
          <div>
            <h3 className="text-base font-semibold text-black">
              Ralph McBride and Janine Neely
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Ethical breeders · home-raised miniature poodles
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-black">
              Health tested · AKC
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Genetic panels, vet care, lifetime support
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-black">
              {SITE.location}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Laveen ranch · shipping nationwide
            </p>
          </div>
        </div>
      </section>

      {available.length > 0 ? (
        <SectionShell>
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-black md:text-3xl">
                Available now
              </h2>
              <p className="mt-2 text-gray-500">
                From our latest litters — each puppy links to sire and dam.
              </p>
            </div>
            <Link
              href="/puppies"
              className="text-base font-medium text-gray-700 underline-offset-2 transition hover:text-black hover:underline md:text-lg"
            >
              See all puppies →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((puppy) => (
              <PuppyCard key={puppy.id} puppy={puppy} />
            ))}
          </div>
        </SectionShell>
      ) : null}
    </>
  );
}
