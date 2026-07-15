import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import {
  formatApplicationStatus,
  formatDate,
} from "@/lib/format";
import { btnSecondary } from "@/components/admin/field";
import { APPLICATION_STATUSES } from "@/lib/validations/application";

export const metadata = { title: "Admin · Applications" };

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminApplicationsPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  const statusFilter =
    params.status &&
    APPLICATION_STATUSES.includes(
      params.status as (typeof APPLICATION_STATUSES)[number],
    )
      ? params.status
      : null;

  const applications = await db.application.findMany({
    where: statusFilter ? { status: statusFilter as never } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      puppy: { select: { name: true, slug: true } },
      user: { select: { email: true, name: true } },
    },
  });

  const counts = await db.application.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const countMap = Object.fromEntries(
    counts.map((c) => [c.status, c._count._all]),
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-black">
          Applications
        </h1>
        <p className="mt-1 text-gray-500">
          Review customer applications and update status.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip href="/admin/applications" active={!statusFilter} label="All" />
        {APPLICATION_STATUSES.map((s) => (
          <FilterChip
            key={s}
            href={`/admin/applications?status=${s}`}
            active={statusFilter === s}
            label={`${formatApplicationStatus(s)}${
              countMap[s] != null ? ` (${countMap[s]})` : ""
            }`}
          />
        ))}
      </div>

      {applications.length === 0 ? (
        <p className="text-gray-500">No applications in this view.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Applicant</th>
                <th className="px-4 py-3 font-medium">Puppy</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3">
                    <p className="font-medium text-black">{app.name}</p>
                    <p className="text-xs text-gray-500">{app.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {app.puppy?.name ?? "General"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={app.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(app.createdAt, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/applications/${app.id}`}
                      className={btnSecondary}
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white"
          : "rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-300 hover:text-black"
      }
    >
      {label}
    </Link>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    NEW: "bg-sky-50 text-sky-800 ring-sky-100",
    REVIEWING: "bg-amber-50 text-amber-900 ring-amber-100",
    APPROVED: "bg-emerald-50 text-emerald-800 ring-emerald-100",
    DECLINED: "bg-red-50 text-red-800 ring-red-100",
    WAITLISTED: "bg-gray-100 text-gray-700 ring-gray-200",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        styles[status] ?? "bg-gray-50 text-gray-600 ring-gray-200"
      }`}
    >
      {formatApplicationStatus(status)}
    </span>
  );
}
