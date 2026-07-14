import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "About Us",
  description: `Learn about ${SITE.name} and our boutique breeding program.`,
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="Our Family"
        subtitle="Breeding miniature poodle companions in Arizona"
      />
      <SectionShell>
        <div className="mx-auto max-w-3xl space-y-6 text-lg leading-relaxed text-gray-700">
          <h2 className="text-3xl font-semibold tracking-tight text-black">
            Our Story
          </h2>
          <p>
            Welcome to {SITE.name} — a boutique, family-run poodle breeding home
            in the Phoenix area. Content from the previous site can be migrated
            here and managed via admin when the CMS is wired up.
          </p>
          <p className="text-gray-500">— {SITE.name}</p>
        </div>
      </SectionShell>
    </>
  );
}
