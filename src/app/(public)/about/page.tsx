import { SectionShell } from "@/components/ui/section-shell";

const FULL_LOGO =
  "https://images.mcneelyfamilypoodles.com/About/McNeely%20Logo.jpg";
const JANINE =
  "https://images.mcneelyfamilypoodles.com/About/Janine%20Hero.png";
const RALPH =
  "https://images.mcneelyfamilypoodles.com/About/Ralph%20Hero.png";
const OLEANDER =
  "https://images.mcneelyfamilypoodles.com/About/Oleander%20Hero.jpg";

export const metadata = {
  title: "Our Program",
  description:
    "Ralph McBride and Janine Neely breed miniature poodles in Phoenix.",
};

async function imageOk(url: string) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      next: { revalidate: 3600 },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export default async function AboutPage() {
  const showOleander = await imageOk(OLEANDER);

  return (
    <>
      <SectionShell>
        <div className="mx-auto max-w-3xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={FULL_LOGO}
            alt="McNeely Logo"
            className="mb-8 h-28 w-auto md:h-36"
          />
          <h1 className="text-4xl font-bold tracking-tight text-black md:text-5xl">
            Our Program
          </h1>
          <div className="mt-8 space-y-6 text-lg leading-relaxed text-gray-700">
            <p>
              Ralph and Janine McNeely raise miniature poodles in Phoenix.
              By day we work in the physical sciences. The rest of the time our
              time belongs to the dogs!
            </p>
            <p>
              We do not sell a product. We curate a lineage. That means picking
              parents to the highest genetic standards, raising their puppies
              underfoot, and sending them out ready for a long happy life as
              loving companions first, and working or service dogs when that is
              the right match.
            </p>
            <p>
              Health is the whole point. Breeding dogs are genetically tested
              for all common poodle-related disorders. Puppies get fully
              vacinated on schedule, veterinary care, and benchmark checks on
              how they are growing, body and mind, before they leave our home.
            </p>
            <p>
              The program started in 2022 in Laveen. If life changes and you
              cannot keep a dog we placed, our door is always open.
            </p>
          </div>
        </div>
      </SectionShell>

      <section className="border-t border-gray-200 bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-black md:text-4xl">
            Staff
          </h2>
          <div className="mx-auto mt-10 grid max-w-4xl gap-12 md:grid-cols-2">
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={JANINE}
                alt="Janine Neely"
                className="aspect-[4/5] w-full rounded-2xl border border-gray-200 object-cover"
              />
              <figcaption className="mt-4">
                <h3 className="text-xl font-semibold text-black">Janine</h3>
                <p className="mt-1 text-sm text-gray-500">Gene Jockey</p>
              </figcaption>
            </figure>
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={RALPH}
                alt="Ralph McBride"
                className="aspect-[4/5] w-full rounded-2xl border border-gray-200 object-cover"
              />
              <figcaption className="mt-4">
                <h3 className="text-xl font-semibold text-black">Ralph</h3>
                <p className="mt-1 text-sm text-gray-500">Poodle Ranger</p>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-black md:text-4xl">
            Interns
          </h2>
          <figure className="mt-10 max-w-sm">
            {showOleander ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={OLEANDER}
                alt="Oleander Lawrence"
                className="aspect-[4/5] w-full rounded-2xl border border-gray-200 object-cover"
              />
            ) : null}
            <figcaption className={showOleander ? "mt-4" : undefined}>
              <h3 className="text-xl font-semibold text-black">
                Oleander
              </h3>
              <p className="mt-1 text-sm text-gray-500">Master of Puppies</p>
            </figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}
