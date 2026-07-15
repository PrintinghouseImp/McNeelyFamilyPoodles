import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { isPdfUrl } from "@/lib/uploads";
import { btnPrimary, btnSecondary } from "@/components/admin/field";

export const metadata = { title: "Admin · Medical records" };

type Props = {
  searchParams: Promise<{ parent?: string; puppy?: string }>;
};

export default async function AdminMedicalPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;

  const where =
    params.parent
      ? { parentDogId: params.parent }
      : params.puppy
        ? { puppyId: params.puppy }
        : {};

  const [records, filterParent, filterPuppy] = await Promise.all([
    db.medicalRecord.findMany({
      where,
      orderBy: [{ recordDate: "desc" }, { createdAt: "desc" }],
      include: {
        parentDog: { select: { id: true, name: true } },
        puppy: { select: { id: true, name: true } },
      },
    }),
    params.parent
      ? db.parentDog.findUnique({
          where: { id: params.parent },
          select: { id: true, name: true },
        })
      : null,
    params.puppy
      ? db.puppy.findUnique({
          where: { id: params.puppy },
          select: { id: true, name: true },
        })
      : null,
  ]);

  const filterLabel = filterParent
    ? `Parent · ${filterParent.name}`
    : filterPuppy
      ? `Puppy · ${filterPuppy.name}`
      : null;

  const newHref = params.parent
    ? `/admin/medical/new?parent=${params.parent}`
    : params.puppy
      ? `/admin/medical/new?puppy=${params.puppy}`
      : "/admin/medical/new";

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            Medical records
          </h1>
          <p className="mt-1 max-w-2xl text-gray-500">
            Upload PDFs or scanned images with a clear title/label. Not shown on
            the public site. When you grant ownership on a puppy, that customer
            can view the puppy&apos;s records in their portal vault.
          </p>
          {filterLabel ? (
            <p className="mt-2 text-sm text-gray-600">
              Filtered: <span className="font-medium text-black">{filterLabel}</span>
              {" · "}
              <Link href="/admin/medical" className="hover:underline">
                Show all
              </Link>
            </p>
          ) : null}
        </div>
        <Link href={newHref} className={btnPrimary}>
          Add record
        </Link>
      </div>

      {records.length === 0 ? (
        <p className="text-gray-500">
          No medical records yet. Add a titled PDF or scan for a parent or puppy.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Label / title</th>
                <th className="px-4 py-3 font-medium">Dog</th>
                <th className="px-4 py-3 font-medium">Record date</th>
                <th className="px-4 py-3 font-medium">File</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r) => {
                const dog = r.parentDog
                  ? { kind: "Parent", name: r.parentDog.name }
                  : r.puppy
                    ? { kind: "Puppy", name: r.puppy.name }
                    : null;
                const fileKind = r.fileUrl
                  ? isPdfUrl(r.fileUrl)
                    ? "PDF"
                    : "Image / scan"
                  : "None";

                return (
                  <tr key={r.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3">
                      <span className="font-medium text-black">{r.title}</span>
                      {r.notes ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">
                          {r.notes}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {dog ? `${dog.kind} · ${dog.name}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(r.recordDate) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{fileKind}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/medical/${r.id}`}
                        className={btnSecondary}
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
