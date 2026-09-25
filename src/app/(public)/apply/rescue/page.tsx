import { RescueForm } from "@/components/apply/rescue-form";
import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Rescue application",
  description: "Form for verified 501(c)(3) organizations.",
};

type Props = { searchParams: Promise<{ submitted?: string }> };

export default async function RescueApplyPage({ searchParams }: Props) {
  const { submitted } = await searchParams;

  return (
    <>
      <PageHero
        title="Rescue application"
        subtitle="Verified nonprofits only."
      />
      <SectionShell>
        {submitted === "1" ? (
          <p className="mx-auto max-w-xl text-center text-gray-600">
            Submitted. We will review your organization.
          </p>
        ) : (
          <RescueForm />
        )}
      </SectionShell>
    </>
  );
}
