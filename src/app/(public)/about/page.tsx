import { SectionShell } from "@/components/ui/section-shell";

const FULL_LOGO =
  "https://images.mcneelyfamilypoodles.com/About/McNeely%20Logo.jpg";
const JANINE =
  "https://images.mcneelyfamilypoodles.com/About/Janine%20Hero.png";
const RALPH =
  "https://images.mcneelyfamilypoodles.com/About/Ralph%20Hero.png";
const OLEANDER =
  "https://images.mcneelyfamilypoodles.com/About/Oleander.jpg";

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
            our program
          </h1>
          <div className="mt-8 space-y-6 text-lg leading-relaxed text-gray-700">
            <p>
              Ralph McBride and Janine Neely breed miniature poodles in
              Phoenix. We are a household of working scientists who live with
              the breed and take its long-term health as the point of the
              program.
            </p>
            <p>
              Poodles are not a product. They are a lineage. Our job is to
              choose carefully, raise them in the house, and send them out
              ready for adult life—as companions first, and as working or
              service prospects when that is the match.
            </p>
            <p>
              That means genetic testing of breeding dogs, veterinary care and
              vaccinations for puppies, and a steady evaluation of how each
              puppy is developing, body and temperament, before it leaves.
            </p>
            <p>
              The program started in 2022 in Laveen. Placement includes a
              lifetime take-back. Rescue organizations in the valley that need
              help with other breeds can ask.
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
                <h3 className="text-xl font-semibold text-black">Janine Neely</h3>
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
                <h3 className="text-xl font-semibold text-black">Ralph McBride</h3>
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
                Oleander Lawrence
              </h3>
              <p className="mt-1 text-sm text-gray-500">Master of Puppies</p>
            </figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}
