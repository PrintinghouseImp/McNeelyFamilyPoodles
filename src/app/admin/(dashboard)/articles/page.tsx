import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { btnPrimary, btnSecondary } from "@/components/admin/field";

export const metadata = { title: "Admin · Articles" };

export default async function AdminArticlesPage() {
  await requireAdmin();
  const articles = await db.article.findMany({
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            Articles
          </h1>
          <p className="mt-1 text-gray-500">
            Technical and informational content for the public Articles page.
          </p>
        </div>
        <Link href="/admin/articles/new" className={btnPrimary}>
          New article
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="text-gray-500">No articles yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Published</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-medium text-black">{a.title}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {a.isPublished ? "Published" : "Draft"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(a.publishedAt, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/articles/${a.id}`} className={btnSecondary}>
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
