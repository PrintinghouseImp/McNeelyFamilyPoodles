import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";

export const metadata = {
  title: "Shop",
  description:
    "Recommended products and items from McNeely Family Poodles.",
};

export default function ShopPage() {
  return (
    <>
      <PageHero title="Shop" subtitle="Sponsored picks and ranch favorites" />
      <SectionShell>
        <p className="mx-auto max-w-2xl text-center text-gray-500">
          Affiliate links (e.g. Amazon) and items you sell will list here from{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700">
            ShopItem
          </code>
          .
        </p>
      </SectionShell>
    </>
  );
}
