import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { btnPrimary, btnSecondary } from "@/components/admin/field";

export const metadata = { title: "Admin · Forever Homes" };

export default async function AdminForeverHomesPage() {
  await requireAdmin();
  const stories = await db.foreverHome.findMany({
    orderBy: [{ sortOrder: "asc" }, { placedAt: "desc" }],
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            Forever Homes
          </h1>
          <p className="mt-1 text-gray-500">
            Alumni photos and testimonials for the public Forever Homes page.
          </p>
        </div>
        <Link href="/admin/forever-homes/new" className={btnPrimary}>
          New story
        </Link>
      </div>

      {stories.length === 0 ? (
        <p className="text-gray-500">No forever-home stories yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Dog</th>
                <th className="px-4 py-3 font-medium">Family</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Placed</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stories.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-medium text-black">{s.dogName}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.familyName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {s.isPublished ? "Published" : "Draft"}
                    {s.photoUrl ? " · Photo" : ""}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(s.placedAt, {
                      year: "numeric",
                      month: "short",
                    }) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/forever-homes/${s.id}`}
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
