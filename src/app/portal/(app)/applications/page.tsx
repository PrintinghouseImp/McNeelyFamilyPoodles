import Link from "next/link";
import { requirePortalUser } from "@/lib/portal";
import { db } from "@/lib/db";
import {
  formatApplicationStatus,
  formatDate,
} from "@/lib/format";

export const metadata = { title: "My applications" };

type Props = {
  searchParams: Promise<{ submitted?: string }>;
};

export default async function PortalApplicationsPage({ searchParams }: Props) {
  const session = await requirePortalUser();
  const params = await searchParams;

  const applications = await db.application.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      puppy: { select: { name: true, slug: true } },
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            My applications
          </h1>
          <p className="mt-2 text-gray-500">
            Track status as the breeder reviews your request.
          </p>
        </div>
        <Link
          href="/apply"
          className="inline-flex rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-900"
        >
          New application
        </Link>
      </div>

      {params.submitted === "1" ? (
        <p
          className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          Application submitted. We&apos;ll review it and update the status here.
        </p>
      ) : null}

      {applications.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">You have no applications yet.</p>
          <Link
            href="/apply"
            className="mt-4 inline-flex rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-900"
          >
            Start an application
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
          {applications.map((app) => (
            <li key={app.id} className="px-5 py-4 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium text-black">
                  {app.puppy?.name
                    ? `Application for ${app.puppy.name}`
                    : "General application"}
                </p>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                  {formatApplicationStatus(app.status)}
                </span>
              </div>
              <p className="mt-1 text-gray-500">
                Submitted {formatDate(app.createdAt) ?? "—"}
                {app.email ? ` · ${app.email}` : null}
              </p>
              {app.message ? (
                <p className="mt-2 line-clamp-2 text-gray-600">{app.message}</p>
              ) : null}
              {app.puppy?.slug ? (
                <Link
                  href={`/puppies/${app.puppy.slug}`}
                  className="mt-2 inline-block text-xs text-gray-500 hover:text-black"
                >
                  View puppy →
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
