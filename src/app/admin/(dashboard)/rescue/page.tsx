import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Admin · Rescue" };

export default async function AdminRescuePage() {
  await requireAdmin();

  const rows = await db.rescueApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-black">
          Rescue applications
        </h1>
        <p className="mt-1 text-gray-500">
          Submissions from organizations that confirmed 501(c)(3) status.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-gray-500">No rescue applications yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-[720px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Organization</th>
                <th className="px-4 py-3 font-medium">EIN</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Focus</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-black">
                      {row.organizationName}
                    </p>
                    <a
                      href={row.website}
                      className="text-xs text-gray-500 hover:text-black"
                    >
                      {row.website}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {row.ein}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <p>{row.contactName}</p>
                    <p className="text-xs text-gray-500">{row.email}</p>
                    {row.phone ? (
                      <p className="text-xs text-gray-500">{row.phone}</p>
                    ) : null}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-gray-600">
                    <p className="line-clamp-3">{row.focus}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {formatDate(row.createdAt) ?? "—"}
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
