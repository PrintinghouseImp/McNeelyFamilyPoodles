import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";

export const metadata = {
  title: "Social",
  description: "Follow McNeely Family Poodles on Instagram and Facebook.",
};

export default function SocialPage() {
  return (
    <>
      <PageHero title="Social" subtitle="Instagram · Facebook" />
      <SectionShell>
        <p className="mx-auto max-w-2xl text-center text-gray-500">
          Profile links plus a curated feed of posts (admin-managed). Live Meta
          API firehose is optional later if you complete app review.
        </p>
      </SectionShell>
    </>
  );
}
