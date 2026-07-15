import Link from "next/link";
import { requirePortalUser } from "@/lib/portal";
import { db } from "@/lib/db";

export const metadata = {
  title: "My portal",
};

export default async function PortalHomePage() {
  const session = await requirePortalUser();
  const userId = session.user.id;

  const [applicationCount, depositCount, dogCount] = await Promise.all([
    db.application.count({ where: { userId } }),
    db.depositRequest.count({ where: { userId } }),
    db.dogOwnership.count({ where: { userId } }),
  ]);

  const firstName =
    session.user.name?.split(" ")[0] ||
    session.user.email?.split("@")[0] ||
    "there";

  const cards = [
    {
      href: "/portal/applications",
      label: "Applications",
      description: "Submit and track puppy applications",
      count: applicationCount,
      countLabel: "on file",
    },
    {
      href: "/portal/deposits",
      label: "Deposit requests",
      description: "Venmo, Zelle, or PayPal reservation requests",
      count: depositCount,
      countLabel: "requests",
    },
    {
      href: "/portal/dogs",
      label: "My dogs & documents",
      description: "Post-adoption records for your dogs",
      count: dogCount,
      countLabel: "dogs",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-black">
        Welcome, {firstName}
      </h1>
      <p className="mt-2 max-w-2xl text-gray-500">
        You&apos;re signed in
        {session.user.email ? (
          <>
            {" "}
            as <span className="text-gray-700">{session.user.email}</span>
          </>
        ) : null}
        . Apply for a puppy, request a deposit, and—once you&apos;ve joined
        the family—view your personal documents here.
      </p>

      {session.user.role === "ADMIN" ? (
        <p className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          You&apos;re also an admin.{" "}
          <Link href="/admin" className="font-medium text-black hover:underline">
            Open breeder admin →
          </Link>
        </p>
      ) : null}

      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <li key={card.href}>
            <Link
              href={card.href}
              className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-gray-300 hover:shadow-sm"
            >
              <p className="font-medium text-black">{card.label}</p>
              <p className="mt-2 flex-1 text-sm text-gray-500">
                {card.description}
              </p>
              <p className="mt-4 text-2xl font-semibold text-black">
                {card.count}
                <span className="ml-2 text-sm font-normal text-gray-400">
                  {card.countLabel}
                </span>
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/apply"
          className="inline-flex rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-900"
        >
          Apply for a puppy
        </Link>
        <Link
          href="/puppies"
          className="inline-flex rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-black"
        >
          Browse puppies
        </Link>
      </div>
    </div>
  );
}
