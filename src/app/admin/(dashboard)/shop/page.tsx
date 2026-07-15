import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatPriceCents } from "@/lib/format";
import { btnPrimary, btnSecondary } from "@/components/admin/field";

export const metadata = { title: "Admin · Shop" };

export default async function AdminShopPage() {
  await requireAdmin();
  const items = await db.shopItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            Shop
          </h1>
          <p className="mt-1 text-gray-500">
            Affiliate links and products for the public Shop page.
          </p>
        </div>
        <Link href="/admin/shop/new" className={btnPrimary}>
          New item
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500">No shop items yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-medium text-black">{item.title}</td>
                  <td className="px-4 py-3 text-gray-600">{item.type}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatPriceCents(item.priceCents) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {item.isPublished ? "Published" : "Hidden"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/shop/${item.id}`} className={btnSecondary}>
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
