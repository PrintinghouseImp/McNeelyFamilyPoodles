import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatSex } from "@/lib/format";
import { btnPrimary, btnSecondary } from "@/components/admin/field";

export const metadata = { title: "Admin · Sires & Dams" };

export default async function AdminParentsPage() {
  await requireAdmin();

  const parents = await db.parentDog.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { photos: true } } },
  });

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            Sires & Dams
          </h1>
          <p className="mt-1 text-gray-500">
            Breeding dogs shown on the public parents pages when published.
          </p>
        </div>
        <Link href="/admin/parents/new" className={btnPrimary}>
          Add parent
        </Link>
      </div>

      {parents.length === 0 ? (
        <p className="text-gray-500">No parents yet. Add a sire or dam.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Sex</th>
                <th className="px-4 py-3 font-medium">Color</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Photos</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {parents.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-medium text-black">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{formatSex(p.sex)}</td>
                  <td className="px-4 py-3 text-gray-600">{p.color ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {[
                      p.isPublished ? "Published" : "Draft",
                      p.isRetired ? "Retired" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p._count.photos}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/parents/${p.id}`}
                      className={btnSecondary}
                    >
                      Edit
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
