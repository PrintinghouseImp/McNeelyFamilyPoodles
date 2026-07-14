import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";

export const metadata = {
  title: "Technical Articles",
  description:
    "Informational articles on poodle care, genetics, and breeding topics.",
};

export default function ArticlesPage() {
  return (
    <>
      <PageHero
        title="Technical Articles"
        subtitle="Genetics, care, and ranch knowledge"
      />
      <SectionShell>
        <p className="mx-auto max-w-2xl text-center text-gray-500">
          Published articles from the database will appear here as a card grid.
        </p>
      </SectionShell>
    </>
  );
}
