import Link from "next/link";
import { ApplicationForm } from "@/components/apply/application-form";
import { PageHero } from "@/components/ui/page-hero";
import { SectionShell } from "@/components/ui/section-shell";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isPortalRole } from "@/lib/portal";
import { formatPuppyStatus } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Application",
  description: "Apply for a McNeely Family Poodles puppy.",
};

type Props = {
  searchParams: Promise<{ puppy?: string }>;
};

export default async function ApplyPage({ searchParams }: Props) {
  const session = await auth();
  const signedIn = Boolean(
    session?.user?.id && isPortalRole(session.user.role),
  );

  const params = await searchParams;
  const puppySlug = params.puppy?.trim();

  const [puppies, selectedPuppy] = await Promise.all([
    db.puppy.findMany({
      where: {
        isPublished: true,
        status: { in: ["AVAILABLE", "GUARDIANSHIP", "RESERVED"] },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, status: true, slug: true },
    }),
    puppySlug
      ? db.puppy.findFirst({
          where: { slug: puppySlug, isPublished: true },
          select: { id: true, name: true },
        })
      : null,
  ]);

  const puppyOptions = puppies.map((p) => ({
    id: p.id,
    name: p.name,
    status: formatPuppyStatus(p.status),
  }));

  return (
    <>
      <PageHero
        title="Puppy Application"
        subtitle="Tell us about your home and the companion you are hoping for"
      />
      <SectionShell>
        {!signedIn ? (
          <div className="mx-auto max-w-xl text-center">
            <p className="text-gray-500">
              Sign in with Google or Facebook to submit an application. We link
              it to your account so you can track status in the customer portal.
            </p>
            {selectedPuppy ? (
              <p className="mt-3 text-sm text-gray-600">
                You were viewing{" "}
                <span className="font-medium text-black">{selectedPuppy.name}</span>
                — you can select them after sign-in.
              </p>
            ) : null}
            <Link
              href={`/portal/login?callbackUrl=${encodeURIComponent(
                puppySlug ? `/apply?puppy=${puppySlug}` : "/apply",
              )}`}
              className="mt-8 inline-block rounded-full bg-black px-8 py-3.5 font-medium text-white transition hover:bg-gray-900"
            >
              Sign in to apply →
            </Link>
          </div>
        ) : (
          <div>
            <p className="mx-auto mb-8 max-w-xl text-center text-sm text-gray-500">
              Signed in as{" "}
              <span className="text-gray-700">
                {session?.user?.email ?? session?.user?.name}
              </span>
              . After you submit, track status under{" "}
              <Link
                href="/portal/applications"
                className="underline-offset-2 hover:text-black hover:underline"
              >
                My applications
              </Link>
              .
            </p>
            <ApplicationForm
              puppies={puppyOptions}
              defaultPuppyId={selectedPuppy?.id}
              defaultName={session?.user?.name ?? undefined}
              defaultEmail={session?.user?.email ?? undefined}
            />
          </div>
        )}
      </SectionShell>
    </>
  );
}
