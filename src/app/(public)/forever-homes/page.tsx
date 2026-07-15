import Link from "next/link";
import { PhotoFrame } from "@/components/inventory/photo-frame";
import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";
import { SITE } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "Forever Homes",
  description: `Happy families and alumni from ${SITE.name} — photos and testimonials.`,
};

type Story = {
  id: string;
  dogName: string;
  familyName: string | null;
  quote: string;
  photoUrl: string | null;
  location: string | null;
  placedAt: Date | null;
};

const PLACEHOLDERS: Story[] = [
  {
    id: "ph-1",
    dogName: "Pepper",
    familyName: "The Rivera Family",
    quote:
      "Placeholder testimonial — “She settled in from day one and is already the heart of our home.” Replace with a real forever-home story.",
    photoUrl: null,
    location: "Phoenix, AZ",
    placedAt: new Date("2025-10-01"),
  },
  {
    id: "ph-2",
    dogName: "Buddy",
    familyName: "The Chen Family",
    quote:
      "Placeholder testimonial — “Thoughtful breeders, healthy puppy, and ongoing support. We could not be happier.”",
    photoUrl: null,
    location: "Scottsdale, AZ",
    placedAt: new Date("2025-08-12"),
  },
  {
    id: "ph-3",
    dogName: "Luna",
    familyName: "The Brooks Family",
    quote:
      "Placeholder testimonial — “Our first miniature poodle has brought so much joy. Thank you for the careful match.”",
    photoUrl: null,
    location: "Tucson, AZ",
    placedAt: new Date("2025-06-20"),
  },
  {
    id: "ph-4",
    dogName: "Milo",
    familyName: "The Patel Family",
    quote:
      "Placeholder testimonial — “Clear communication and a well-socialized companion. Highly recommend.”",
    photoUrl: null,
    location: "Mesa, AZ",
    placedAt: new Date("2025-05-05"),
  },
];

export default async function ForeverHomesPage() {
  const rows = await db.foreverHome.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { placedAt: "desc" }, { createdAt: "desc" }],
  });

  const stories: Story[] =
    rows.length > 0
      ? rows.map((r) => ({
          id: r.id,
          dogName: r.dogName,
          familyName: r.familyName,
          quote: r.quote,
          photoUrl: r.photoUrl,
          location: r.location,
          placedAt: r.placedAt,
        }))
      : PLACEHOLDERS;

  const usingPlaceholders = rows.length === 0;
  const withPhotos = stories.filter((s) => s.photoUrl);

  return (
    <>
      <PageHero
        title="Forever Homes"
        subtitle="Alumni photos and words from families who found their match"
      />
      <SectionShell>
        <p className="mx-auto mb-12 max-w-2xl text-center text-gray-500">
          Every placement is a long-term relationship. Browse happy endings below,
          then{" "}
          <Link
            href="/apply"
            className="text-gray-700 underline-offset-2 hover:text-black hover:underline"
          >
            start an application
          </Link>{" "}
          when you are ready.
        </p>

        {/* Photo grid */}
        <section className="mb-16">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-black">
              Photo gallery
            </h2>
            <p className="text-sm text-gray-500">
              {usingPlaceholders
                ? "Sample layout — add photos when stories are published"
                : `${withPhotos.length} of ${stories.length} with photos`}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {stories.map((story) => (
              <figure
                key={`grid-${story.id}`}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
              >
                {story.photoUrl ? (
                  <PhotoFrame
                    src={story.photoUrl}
                    alt={`${story.dogName}${story.familyName ? ` with ${story.familyName}` : ""}`}
                  />
                ) : (
                  <div className="photo-frame min-h-[10rem]">
                    <span className="px-3 py-10 text-center text-sm font-medium text-gray-400">
                      {story.dogName}
                    </span>
                  </div>
                )}
                <figcaption className="border-t border-gray-100 px-3 py-2 text-center text-xs text-gray-500">
                  <span className="font-medium text-gray-700">{story.dogName}</span>
                  {story.familyName ? ` · ${story.familyName}` : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-tight text-black">
              Family testimonials
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {usingPlaceholders
                ? "Placeholder quotes until forever-home stories are added."
                : "From families who welcomed a McNeely poodle."}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {stories.map((story) => (
              <blockquote
                key={`quote-${story.id}`}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6"
              >
                <div className="flex gap-4">
                  {story.photoUrl ? (
                    <div className="hidden w-24 shrink-0 overflow-hidden rounded-xl border border-gray-100 sm:block">
                      <PhotoFrame
                        src={story.photoUrl}
                        alt={story.dogName}
                      />
                    </div>
                  ) : (
                    <div className="photo-frame hidden w-24 shrink-0 rounded-xl sm:flex">
                      <span className="px-2 py-6 text-center text-xs text-gray-400">
                        {story.dogName.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-base leading-relaxed text-gray-700">
                      “{story.quote.replace(/^["“]|["”]$/g, "")}”
                    </p>
                    <footer className="mt-4 text-sm text-gray-500">
                      <p className="font-medium text-black">
                        {story.familyName ?? "A McNeely family"}
                        {story.dogName ? (
                          <span className="font-normal text-gray-500">
                            {" "}
                            · with {story.dogName}
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {[
                          story.location,
                          story.placedAt
                            ? formatDate(story.placedAt, {
                                year: "numeric",
                                month: "long",
                              })
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </footer>
                  </div>
                </div>
              </blockquote>
            ))}
          </div>
        </section>

        <div className="mt-14 text-center">
          <Link
            href="/apply"
            className="inline-flex rounded-full bg-black px-8 py-3.5 text-sm font-medium text-white transition hover:bg-gray-900"
          >
            Apply for a puppy
          </Link>
          <p className="mt-3 text-sm text-gray-500">
            Or{" "}
            <Link
              href="/puppies"
              className="text-gray-700 underline-offset-2 hover:text-black hover:underline"
            >
              browse available puppies
            </Link>
            .
          </p>
        </div>
      </SectionShell>
    </>
  );
}
