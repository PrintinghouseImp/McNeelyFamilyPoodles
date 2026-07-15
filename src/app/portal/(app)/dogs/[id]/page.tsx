import Link from "next/link";
import { btnPrimary, btnSecondary } from "@/components/admin/field";
import { db } from "@/lib/db";
import { formatDate, formatSex } from "@/lib/format";
import { requireOwnedPuppy } from "@/lib/portal";
import { isImageUrl, isPdfUrl } from "@/lib/uploads";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const puppy = await db.puppy.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: puppy ? `My dog · ${puppy.name}` : "My dog" };
}

export default async function PortalDogDetailPage({ params }: Props) {
  const { id } = await params;
  const { puppy, ownership, session } = await requireOwnedPuppy(id);

  const primaryPhoto = puppy.photos[0];
  const docsWithFiles = puppy.medicalRecords.filter((r) => r.fileUrl);
  const isAdminPreview =
    session.user.role === "ADMIN" && ownership == null;

  return (
    <div>
      <Link
        href="/portal/dogs"
        className="text-sm text-gray-500 transition hover:text-black"
      >
        ← My dogs
      </Link>

      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start">
        {primaryPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element -- local uploads; preserve aspect
          <img
            src={primaryPhoto.url}
            alt={primaryPhoto.alt ?? puppy.name}
            className="h-40 w-40 shrink-0 rounded-2xl border border-gray-200 object-contain bg-gray-50"
          />
        ) : (
          <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
            No photo
          </div>
        )}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            {puppy.name}
          </h1>
          <p className="mt-1 text-gray-500">
            {[formatSex(puppy.sex), puppy.color].filter(Boolean).join(" · ") ||
              "Your companion"}
          </p>
          {puppy.litter ? (
            <p className="mt-1 text-sm text-gray-400">
              Litter {puppy.litter.name ?? puppy.litter.slug}
              {puppy.litter.sire || puppy.litter.dam
                ? ` · ${[puppy.litter.sire?.name, puppy.litter.dam?.name]
                    .filter(Boolean)
                    .join(" × ")}`
                : null}
            </p>
          ) : null}
          {ownership ? (
            <p className="mt-2 text-sm text-gray-500">
              Access since {formatDate(ownership.grantedAt) ?? "—"}
            </p>
          ) : null}
          {isAdminPreview ? (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Admin preview — you are not listed as an owner for this dog.
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/puppies/${puppy.slug}`} className={btnSecondary}>
              Public profile
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight text-black">
          Documents
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Vet records, vaccinations, and other files the breeder attached to{" "}
          {puppy.name}. Labels match the medical records maintained by the
          program.
        </p>

        {puppy.medicalRecords.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-600">
              No documents are on file for this dog yet. Check back after the
              breeder uploads records.
            </p>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
            {puppy.medicalRecords.map((doc) => {
              const kind = doc.fileUrl
                ? isPdfUrl(doc.fileUrl)
                  ? "PDF"
                  : isImageUrl(doc.fileUrl)
                    ? "Image / scan"
                    : "File"
                : "Note only";

              return (
                <li
                  key={doc.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-black">{doc.title}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {kind}
                      {doc.recordDate
                        ? ` · ${formatDate(doc.recordDate)}`
                        : ""}
                    </p>
                    {doc.notes ? (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {doc.notes}
                      </p>
                    ) : null}
                  </div>
                  {doc.fileUrl ? (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={btnPrimary}
                    >
                      View / download
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">No file</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {docsWithFiles.length > 0 ? (
          <p className="mt-4 text-xs text-gray-400">
            {docsWithFiles.length} downloadable file
            {docsWithFiles.length === 1 ? "" : "s"}
          </p>
        ) : null}
      </section>
    </div>
  );
}
