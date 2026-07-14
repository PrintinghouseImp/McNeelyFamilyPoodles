import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";

export const metadata = {
  title: "Application",
  description: "Apply for a McNeely Family Poodles puppy.",
};

export default function ApplyPage() {
  return (
    <>
      <PageHero
        title="Puppy Application"
        subtitle="Tell us about your home and the companion you are hoping for"
      />
      <SectionShell className="max-w-2xl text-center">
        <p className="text-gray-500">
          Applications are submitted from the customer portal after signing in
          with Google or Facebook.
        </p>
        <Link
          href="/portal/login"
          className="mt-8 inline-block rounded-full bg-black px-8 py-3.5 font-medium text-white transition hover:bg-gray-900"
        >
          Sign in to apply →
        </Link>
      </SectionShell>
    </>
  );
}
