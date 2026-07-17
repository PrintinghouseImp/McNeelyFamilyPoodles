import Link from "next/link";
import {
  AlumniDogCard,
  formatSex,
} from "@/components/inventory/alumni-dog-card";
import {
  AlumniFilters,
  type AlumniView,
} from "@/components/inventory/alumni-filters";
import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";
import { SITE } from "@/lib/constants";
import { db } from "@/lib/db";

export const metadata = {
  title: "Alumni",
  description: `Retired parents and adopted puppies from ${SITE.name} — forever part of our family.`,
};

type Props = {
  searchParams: Promise<{ view?: string }>;
};

function parseView(raw: string | undefined): AlumniView {
  if (raw === "parents" || raw === "puppies") return raw;
  return "all";
}

export default async function AlumniPage({ searchParams }: Props) {
  const params = await searchParams;
  const view = parseView(params.view);

  const [retiredParents, adoptedPuppies] = await Promise.all([
    db.parentDog.findMany({
      where: { isPublished: true, isRetired: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        photos: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
          take: 1,
        },
      },
    }),
    db.puppy.findMany({
      where: { isPublished: true, isAdopted: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        photos: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
          take: 1,
        },
        litter: {
          include: {
            dam: { select: { name: true } },
            sire: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  const showParents = view === "all" || view === "parents";
  const showPuppies = view === "all" || view === "puppies";
  const empty =
    (showParents ? retiredParents.length === 0 : true) &&
    (showPuppies ? adoptedPuppies.length === 0 : true);

  return (
    <>
      <PageHero
        title="Alumni"
        subtitle="Retired parents and puppies in their forever homes"
      />
      <SectionShell>
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm text-gray-500">
            Here are some of the poodles who helped build our program and puppies who found their families! Looking for active {" "}
            <Link
              href="/parents"
              className="text-gray-700 underline-offset-2 hover:text-black hover:underline"
            >
              Parents
            </Link>{" "}
            and{" "}
            <Link
              href="/puppies"
              className="text-gray-700 underline-offset-2 hover:text-black hover:underline"
            >
              Puppies
            </Link>
            ?
          </p>
          <AlumniFilters
            view={view}
            retiredCount={retiredParents.length}
            adoptedCount={adoptedPuppies.length}
          />
        </div>

        {empty ? (
          <p className="mx-auto max-w-2xl text-center text-gray-500">
            Alumni profiles will appear here when parents are marked Retired or
            puppies are marked Adopted in the admin portal.
          </p>
        ) : (
          <div className="space-y-16">
            {showParents ? (
              <section
                id="retired-parents"
                aria-labelledby="retired-parents-heading"
              >
                <div className="mb-8 border-b border-gray-200 pb-4">
                  <h2
                    id="retired-parents-heading"
                    className="text-2xl font-semibold tracking-tight text-black"
                  >
                    Retired Parents
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Sires and dams who have stepped back from the breeding
                    program.
                  </p>
                </div>
                {retiredParents.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No retired parents published yet.
                  </p>
                ) : (
                  <div className="space-y-8">
                    {retiredParents.map((parent) => (
                      <AlumniDogCard
                        key={parent.id}
                        href={`/parents/${parent.slug}`}
                        name={parent.name}
                        badge="Retired"
                        sexLabel={formatSex(parent.sex)}
                        color={parent.color}
                        note={parent.description}
                        photos={parent.photos}
                      />
                    ))}
                  </div>
                )}
              </section>
            ) : null}

            {showPuppies ? (
              <section
                id="adopted-puppies"
                aria-labelledby="adopted-puppies-heading"
              >
                <div className="mb-8 border-b border-gray-200 pb-4">
                  <h2
                    id="adopted-puppies-heading"
                    className="text-2xl font-semibold tracking-tight text-black"
                  >
                    Adopted Puppies
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Graduates of our program living in their forever homes.
                  </p>
                </div>
                {adoptedPuppies.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No adopted puppies published yet. Mark a puppy Adopted in
                    admin to move them here.
                  </p>
                ) : (
                  <div className="space-y-8">
                    {adoptedPuppies.map((puppy) => (
                      <AlumniDogCard
                        key={puppy.id}
                        href={`/puppies/${puppy.slug}`}
                        name={puppy.name}
                        badge="Adopted"
                        sexLabel={formatSex(puppy.sex)}
                        color={puppy.color}
                        note={puppy.description}
                        photos={puppy.photos}
                      />
                    ))}
                  </div>
                )}
              </section>
            ) : null}
          </div>
        )}
      </SectionShell>
    </>
  );
}
