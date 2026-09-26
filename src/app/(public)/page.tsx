import Link from "next/link";
import { HeroVideo } from "@/components/home/hero-video";
import { PuppyCard } from "@/components/inventory/puppy-card";
import { SectionShell } from "@/components/ui/section-shell";
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
      <section className="flex min-h-[calc(100svh-4.5rem)] max-w-full flex-col overflow-x-clip bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto grid w-full min-w-0 max-w-6xl flex-1 items-center gap-10 md:grid-cols-2">
          <div className="min-w-0">
            <h1 className="max-w-full text-balance text-4xl font-bold tracking-tight text-black md:text-5xl lg:text-6xl">
              Miniature Poodles
            </h1>
            <p className="mt-5 max-w-full text-lg text-gray-500 md:text-xl">
              Find your next family member with full confidence they&apos;ve
              been raised to the highest standard
            </p>
          </div>
          <div className="min-w-0">
            <HeroVideo />
            <div className="mt-4">
              <Link
                href="/puppies"
                className="inline-flex max-w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-900"
              >
                View available puppies
              </Link>
              <p className="mt-3 max-w-full text-sm text-gray-500">
                Don&apos;t live in Phoenix, AZ? No problem. We offer nationwide
                delivery!
              </p>
            </div>
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
