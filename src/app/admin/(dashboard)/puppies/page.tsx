import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatPuppyPrice, formatPuppyStatus, formatSex } from "@/lib/format";
import { btnPrimary, btnSecondary } from "@/components/admin/field";

export const metadata = { title: "Admin · Puppies" };

export default async function AdminPuppiesPage() {
  await requireAdmin();

  const puppies = await db.puppy.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      litter: { select: { name: true, slug: true } },
      _count: { select: { photos: true } },
    },
  });

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            Puppies
          </h1>
          <p className="mt-1 text-gray-500">
            Status, price, and litter assignment for the public inventory.
          </p>
        </div>
        <Link href="/admin/puppies/new" className={btnPrimary}>
          Add puppy
        </Link>
      </div>

      {puppies.length === 0 ? (
        <p className="text-gray-500">No puppies yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Sex</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Litter</th>
                <th className="px-4 py-3 font-medium">Photos</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {puppies.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3">
                    <span className="font-medium text-black">{p.name}</span>
                    {!p.isPublished ? (
                      <span className="ml-2 text-xs text-gray-400">Draft</span>
                    ) : null}
                    {p.isAdopted ? (
                      <span className="ml-2 text-xs text-gray-500">Alumni</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatSex(p.sex)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.isAdopted
                      ? "Adopted"
                      : formatPuppyStatus(p.status)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatPuppyPrice(p.priceCents, p.priceLabel) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.litter?.name ?? p.litter?.slug ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p._count.photos}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/puppies/${p.id}`}
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
