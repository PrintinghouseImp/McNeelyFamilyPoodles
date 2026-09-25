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
      <section className="flex min-h-[calc(100svh-4.5rem)] flex-col bg-white px-6 py-8">
        <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-black md:text-5xl lg:text-6xl">
              Raising miniature poodles in Phoenix, AZ
            </h1>
            <p className="mt-5 text-lg text-gray-500 md:text-xl">
              Find your next family member with full confidence that
              they&apos;ve been bred with the highest standard of care
            </p>
          </div>
          <HeroVideo />
        </div>
        <div className="mx-auto mt-8 pb-4">
          <Link
            href="/puppies"
            className="inline-flex rounded-full bg-black px-12 py-5 text-xl font-semibold text-white transition hover:bg-gray-900 md:px-14 md:py-6 md:text-2xl"
          >
            View available puppies
          </Link>
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
