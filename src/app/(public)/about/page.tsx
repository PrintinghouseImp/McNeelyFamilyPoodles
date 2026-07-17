import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "About Us",
  description: `Meet Ralph & Janine McNeely and the story behind ${SITE.name}.`,
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="Ralph & Janine McNeely"
        subtitle="Breeding miniature poodle companions · Phoenix, Arizona"
      />
      <SectionShell>
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2 lg:gap-20">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element -- local legacy asset */}
            <img
              src="/legacy/humans/norman_rockwell_poodle_family.webp"
              alt="Ralph & Janine McNeely with their poodles"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>

          <div className="space-y-6 text-lg leading-relaxed text-gray-700">
            <h2 className="text-3xl font-semibold tracking-tight text-black md:text-4xl">
              Our Story
            </h2>
            <p>
              Welcome to the McNeely ranch, a boutique, family-run poodle
              breeding home nestled in the heart of Laveen, AZ. We began this
              adventure in 2022 when we realized we were absolutely crazy about
              poodles, and found the perfect piece of land to give them the very
              best life possible. Here at the ranch, breeding poodles is not
              just a hobby — it&apos;s a lifestyle.
            </p>
            <p>
              Our dogs romp across an acre of green pasture, swim in the pond
              our yard transforms into when we flood irrigate, and sleep on the
              furniture when it&apos;s cold. Every puppy is born in our home,
              raised underfoot, and socialized with kids, goats, and even the
              occasional delivery driver or neighbor who gets recruited for
              puppy parties. Yes, we can schedule you in for one too!
            </p>
            <p>
              Our poodle puppies are all vet-checked, microchipped, vaccinated,
              insured, trained to use a potty pad and doggy door before they go
              home, and every puppy leaves with a lifetime promise: no matter
              how many years pass, if life ever throws you a curveball and you
              can&apos;t keep your poodle, our home is always open. All of our
              breeding dogs are genetically tested for common poodle disorders
              and receive annual vet checkups, routine vaccinations, and dental
              cleanings.
            </p>
            <p>
              At the end of the day, we&apos;re just a couple of poodle-loving
              folks working hard to raise happy, healthy, ridiculously spoiled
              companions and place them in homes that love the breed as much as
              we do. If you&apos;re looking for a puppy who&apos;s been loved
              like family from the moment they took their first breath — and who
              will be loved like family for the rest of their life — you&apos;ve
              come to the right place.
            </p>
            <p className="text-gray-500">
              Warmly,
              <br />
              <span className="font-medium text-black">{SITE.name}</span>
            </p>
          </div>
        </div>
      </SectionShell>

      <section className="border-t border-gray-200 bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="mb-12 text-center text-3xl font-semibold tracking-tight text-black md:text-4xl">
            Visiting Scholars
          </h2>
          <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
            <div className="text-center">
              <div className="relative mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/legacy/humans/oleander_puppy_whisperer.jpg"
                  alt="Oleander Lawrence — Puppy Whisperer"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Puppy Whisperer
              </p>
              <h3 className="mt-1 text-xl font-semibold text-black">
                Oleander Lawrence
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Puppy Trainer · Last Term: Fall 2025
              </p>
              <p className="mt-3 text-sm text-gray-600">
                Specialties: grooming, puppy party coordination
              </p>
            </div>
            <div className="text-center">
              <div className="relative mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/legacy/humans/janine_ralph_funny.webp"
                  alt="Ralph and Janine McNeely"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                The ranch team
              </p>
              <h3 className="mt-1 text-xl font-semibold text-black">
                Ralph & Janine
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Family breeders · Laveen, Arizona
              </p>
              <p className="mt-3 text-sm text-gray-600">
                Home-raised puppies, health-tested parents, lifetime support
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
