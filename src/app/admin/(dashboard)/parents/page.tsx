import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDate, formatSex } from "@/lib/format";
import { btnPrimary, btnSecondary } from "@/components/admin/field";

export const metadata = { title: "Admin · Sires & Dams" };

const parentSelect = {
  id: true,
  name: true,
  sex: true,
  color: true,
  isPublished: true,
  isRetired: true,
  updatedAt: true,
  _count: { select: { photos: true } },
} as const;

async function loadParents() {
  try {
    const rows = await db.parentDog.findMany({
      orderBy: [
        { birthDate: { sort: "desc", nulls: "last" } },
        { name: "asc" },
      ],
      select: { ...parentSelect, birthDate: true },
    });
    return { rows, failed: false };
  } catch (error) {
    console.error("Admin parents list failed", error);
    return { rows: [], failed: true };
  }
}

export default async function AdminParentsPage() {
  await requireAdmin();
  const { rows: parents, failed } = await loadParents();
  const columns = ["Name", "Status", "Color", "Updated"] as const;

  return (
    <div className="min-w-0 max-w-full">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
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

      <div className="admin-table-panel w-full max-w-full rounded-2xl border border-gray-200 bg-white">
        <table className="text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-gray-500">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 text-left font-medium">
                  {column}
                </th>
              ))}
              <th className="px-4 py-3 text-left font-medium">Sex</th>
              <th className="px-4 py-3 text-left font-medium">Photos</th>
              <th className="px-4 py-3 text-left font-medium">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {parents.length === 0 ? (
              failed ? null : (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-gray-500">
                    No parents yet. Add a sire or dam.
                  </td>
                </tr>
              )
            ) : (
              parents.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-black">
                    {p.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {[
                      p.isPublished ? "Published" : "Draft",
                      p.isRetired ? "Retired" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {p.color ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {formatDate(p.updatedAt, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }) ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {formatSex(p.sex)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p._count.photos}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      href={`/admin/parents/${p.id}`}
                      className={btnSecondary}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
