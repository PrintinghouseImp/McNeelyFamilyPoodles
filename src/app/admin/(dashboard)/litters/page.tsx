import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { btnPrimary, btnSecondary } from "@/components/admin/field";

export const metadata = { title: "Admin · Litters" };

export default async function AdminLittersPage() {
  await requireAdmin();

  const litters = await db.litter.findMany({
    orderBy: { birthDate: "desc" },
    include: {
      dam: { select: { name: true } },
      sire: { select: { name: true } },
      _count: { select: { puppies: true, photos: true } },
    },
  });

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            Litters
          </h1>
          <p className="mt-1 text-gray-500">
            Groups puppies under a dam and sire on the public site.
          </p>
        </div>
        <Link href="/admin/litters/new" className={btnPrimary}>
          Add litter
        </Link>
      </div>

      {litters.length === 0 ? (
        <p className="text-gray-500">No litters yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Born</th>
                <th className="px-4 py-3 font-medium">Dam</th>
                <th className="px-4 py-3 font-medium">Sire</th>
                <th className="px-4 py-3 font-medium">Puppies</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {litters.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-medium text-black">
                    {l.name ?? l.slug}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(l.birthDate)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{l.dam.name}</td>
                  <td className="px-4 py-3 text-gray-600">{l.sire.name}</td>
                  <td className="px-4 py-3 text-gray-600">{l._count.puppies}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {l.isPublished ? "Published" : "Draft"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/litters/${l.id}`}
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
