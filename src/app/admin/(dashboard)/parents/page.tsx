import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDate, formatSex } from "@/lib/format";
import { btnPrimary, btnSecondary } from "@/components/admin/field";

export const metadata = { title: "Admin · Sires & Dams" };

const SORTS = ["name", "status", "color", "updated"] as const;
type SortKey = (typeof SORTS)[number];

type Props = {
  searchParams: Promise<{ sort?: string; dir?: string }>;
};

function parseSort(raw: string | undefined): SortKey {
  return SORTS.includes(raw as SortKey) ? (raw as SortKey) : "name";
}

function parseDir(raw: string | undefined, sort: SortKey): "asc" | "desc" {
  if (raw === "asc" || raw === "desc") return raw;
  return sort === "updated" ? "desc" : "asc";
}

export default async function AdminParentsPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  const sort = parseSort(params.sort);
  const dir = parseDir(params.dir, sort);

  const parents = await db.parentDog.findMany({
    orderBy:
      sort === "name"
        ? [{ name: dir }]
        : sort === "color"
          ? [{ color: { sort: dir, nulls: "last" } }, { name: "asc" }]
          : sort === "updated"
            ? [{ updatedAt: dir }]
            : [
                { isRetired: dir },
                { isPublished: dir },
                { name: "asc" },
              ],
    include: { _count: { select: { photos: true } } },
  });

  function sortHref(key: SortKey) {
    const initial = key === "updated" ? "desc" : "asc";
    const next = sort === key ? (dir === "asc" ? "desc" : "asc") : initial;
    return `/admin/parents?sort=${key}&dir=${next}`;
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: "name", label: "Name" },
    { key: "status", label: "Status" },
    { key: "color", label: "Color" },
    { key: "updated", label: "Updated" },
  ];

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
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-3 font-medium">
                    <Link
                      href={sortHref(column.key)}
                      className="inline-flex items-center gap-1 hover:text-black"
                    >
                      {column.label}
                      {sort === column.key ? (dir === "asc" ? " ↑" : " ↓") : ""}
                    </Link>
                  </th>
                ))}
                <th className="px-4 py-3 font-medium">Sex</th>
                <th className="px-4 py-3 font-medium">Photos</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {parents.map((p) => (
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
