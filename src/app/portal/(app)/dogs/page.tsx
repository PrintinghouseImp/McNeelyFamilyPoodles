import Link from "next/link";
import { requirePortalUser } from "@/lib/portal";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { btnPrimary } from "@/components/admin/field";

export const metadata = { title: "My dogs" };

export default async function PortalDogsPage() {
  const session = await requirePortalUser();
  const isAdmin = session.user.role === "ADMIN";

  const ownerships = await db.dogOwnership.findMany({
    where: { userId: session.user.id },
    orderBy: { grantedAt: "desc" },
    include: {
      puppy: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
          medicalRecords: {
            select: { id: true, fileUrl: true },
          },
          photos: {
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
            select: { url: true, alt: true },
          },
        },
      },
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-black">
        My dogs
      </h1>
      <p className="mt-2 max-w-2xl text-gray-500">
        After adoption is confirmed, dogs you own appear here with labeled
        documents (vet records, vaccinations, and other files the program
        uploaded for that dog).
      </p>

      {ownerships.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">
            No dogs linked to your account yet. The breeder grants access after
            placement.
          </p>
          {isAdmin ? (
            <p className="mt-2 text-sm text-gray-500">
              Admins: grant ownership on a puppy page under{" "}
              <span className="font-medium text-black">Owner access</span>, or
              open{" "}
              <Link
                href="/admin/ownerships"
                className="font-medium text-black underline-offset-2 hover:underline"
              >
                Ownerships
              </Link>
              .
            </p>
          ) : null}
          <Link href="/apply" className={`${btnPrimary} mt-4`}>
            Apply for a puppy
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {ownerships.map((o) => {
            const fileCount = o.puppy.medicalRecords.filter(
              (r) => r.fileUrl,
            ).length;
            const docCount = o.puppy.medicalRecords.length;
            const photo = o.puppy.photos[0];

            return (
              <li
                key={o.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
              >
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.url}
                    alt={photo.alt ?? o.puppy.name}
                    className="h-40 w-full object-contain bg-gray-50"
                  />
                ) : null}
                <div className="p-6">
                  <p className="text-lg font-semibold text-black">
                    {o.puppy.name}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {o.puppy.color ?? "Companion"}
                    {" · "}
                    Access since {formatDate(o.grantedAt) ?? "—"}
                  </p>
                  <p className="mt-3 text-sm text-gray-600">
                    {docCount} document{docCount === 1 ? "" : "s"}
                    {fileCount > 0
                      ? ` (${fileCount} with file${fileCount === 1 ? "" : "s"})`
                      : ""}
                  </p>
                  <Link
                    href={`/portal/dogs/${o.puppy.id}`}
                    className="mt-4 inline-flex text-sm font-medium text-black underline-offset-2 hover:underline"
                  >
                    Open document vault →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
