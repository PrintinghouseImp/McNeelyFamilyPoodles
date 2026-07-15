import Link from "next/link";
import { revokeDogOwnership } from "@/app/admin/actions/ownership";
import { btnDanger, btnSecondary } from "@/components/admin/field";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Admin · Ownerships" };

type Props = {
  searchParams: Promise<{ revoked?: string }>;
};

export default async function AdminOwnershipsPage({ searchParams }: Props) {
  await requireAdmin();
  const { revoked } = await searchParams;

  const ownerships = await db.dogOwnership.findMany({
    orderBy: { grantedAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
      puppy: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          _count: { select: { medicalRecords: true } },
        },
      },
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-black">
          Dog ownerships
        </h1>
        <p className="mt-1 max-w-2xl text-gray-500">
          Customers granted portal access to a dog can view that dog&apos;s
          medical records (Phase 4 documents). Grant or revoke from a puppy
          detail page.
        </p>
      </div>

      {revoked ? (
        <p className="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          Owner access revoked.
        </p>
      ) : null}

      {ownerships.length === 0 ? (
        <p className="text-gray-500">
          No ownerships yet. Open a{" "}
          <Link href="/admin/puppies" className="text-black underline-offset-2 hover:underline">
            puppy
          </Link>{" "}
          and use <span className="font-medium text-black">Owner access</span>.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Dog</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Granted</th>
                <th className="px-4 py-3 font-medium">Docs</th>
                <th className="px-4 py-3 font-medium">Notes</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ownerships.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/puppies/${o.puppy.id}`}
                      className="font-medium text-black hover:underline"
                    >
                      {o.puppy.name}
                    </Link>
                    <p className="text-xs text-gray-400">{o.puppy.status}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <p>{o.user.name ?? "—"}</p>
                    <p className="text-xs text-gray-400">{o.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(o.grantedAt) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {o.puppy._count.medicalRecords}
                  </td>
                  <td className="max-w-[12rem] px-4 py-3 text-gray-500">
                    <span className="line-clamp-2">{o.notes ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        href={`/admin/puppies/${o.puppy.id}`}
                        className={btnSecondary}
                      >
                        Puppy
                      </Link>
                      <form action={revokeDogOwnership}>
                        <input type="hidden" name="ownershipId" value={o.id} />
                        <input type="hidden" name="returnTo" value="ownerships" />
                        <button type="submit" className={btnDanger}>
                          Revoke
                        </button>
                      </form>
                    </div>
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
