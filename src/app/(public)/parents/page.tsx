import Link from "next/link";
import { ParentCard } from "@/components/inventory/parent-card";
import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";
import { db } from "@/lib/db";

export const metadata = {
  title: "Sires & Dams",
  description: "Meet the sires and dams of McNeely Family Poodles.",
};

export default async function ParentsPage() {
  // Active breeding dogs only — retired parents live on /alumni
  const parents = await db.parentDog.findMany({
    where: { isPublished: true, isRetired: false },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      photos: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        take: 1,
      },
    },
  });

  const dams = parents.filter((p) => p.sex === "FEMALE");
  const sires = parents.filter((p) => p.sex === "MALE");

  return (
    <>
      <PageHero
        title="Sires & Dams"
        subtitle="The heart of our breeding program"
      />
      <SectionShell>
        {parents.length === 0 ? (
          <p className="mx-auto max-w-2xl text-center text-gray-500">
            Active parent profiles will appear here once they are published.
            Retired dogs are listed on{" "}
            <Link
              href="/alumni"
              className="text-gray-700 underline-offset-2 hover:text-black hover:underline"
            >
              Alumni
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-14">
            {dams.length > 0 ? (
              <section>
                <h2 className="mb-6 text-xl font-semibold text-black">Dams</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {dams.map((parent) => (
                    <ParentCard key={parent.id} parent={parent} />
                  ))}
                </div>
              </section>
            ) : null}

            {sires.length > 0 ? (
              <section>
                <h2 className="mb-6 text-xl font-semibold text-black">Sires</h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {sires.map((parent) => (
                    <ParentCard key={parent.id} parent={parent} />
                  ))}
                </div>
              </section>
            ) : null}

            <p className="text-center text-sm text-gray-500">
              Looking for retired parents?{" "}
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
