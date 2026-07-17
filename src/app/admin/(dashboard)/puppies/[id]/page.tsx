import Link from "next/link";
import { notFound } from "next/navigation";
import {
  grantDogOwnership,
  revokeDogOwnership,
} from "@/app/admin/actions/ownership";
import { deletePuppy, updatePuppy } from "@/app/admin/actions/puppies";
import { PhotoManager } from "@/components/admin/photo-manager";
import {
  btnDanger,
  btnPrimary,
  btnSecondary,
  checkClass,
  inputClass,
  selectClass,
  textareaClass,
  Field,
} from "@/components/admin/field";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    ownerError?: string;
    ownerGranted?: string;
    ownerRevoked?: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const puppy = await db.puppy.findUnique({ where: { id } });
  return { title: puppy ? `Admin · ${puppy.name}` : "Admin · Puppy" };
}

export default async function EditPuppyPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const ownerFlash = await searchParams;

  const [puppy, litters, suggestedCustomers] = await Promise.all([
    db.puppy.findUnique({
      where: { id },
      include: {
        photos: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] },
        medicalRecords: {
          orderBy: [{ recordDate: "desc" }, { createdAt: "desc" }],
          select: { id: true, title: true, recordDate: true, fileUrl: true },
        },
        ownerships: {
          orderBy: { grantedAt: "desc" },
          include: {
            user: { select: { id: true, email: true, name: true } },
          },
        },
      },
    }),
    db.litter.findMany({
      orderBy: { birthDate: "desc" },
      select: { id: true, name: true, slug: true },
    }),
    // Customers who applied or requested a deposit for this puppy (handy defaults)
    db.user.findMany({
      where: {
        role: "CUSTOMER",
        OR: [
          { applications: { some: { puppyId: id } } },
          { depositRequests: { some: { puppyId: id } } },
        ],
      },
      select: { id: true, email: true, name: true },
      orderBy: { email: "asc" },
      take: 20,
    }),
  ]);
  if (!puppy) notFound();

  const ownedUserIds = new Set(puppy.ownerships.map((o) => o.userId));
  const grantSuggestions = suggestedCustomers.filter(
    (u) => !ownedUserIds.has(u.id),
  );

  const priceDollars =
    puppy.priceCents != null ? (puppy.priceCents / 100).toFixed(2) : "";
  const birthValue = puppy.birthDate
    ? puppy.birthDate.toISOString().slice(0, 10)
    : "";

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/puppies"
        className="text-sm text-gray-500 hover:text-black"
      >
        ← All puppies
      </Link>
      <div className="mt-4">
        <h1 className="text-3xl font-semibold tracking-tight text-black">
          {puppy.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Public:{" "}
          <Link
            href={`/puppies/${puppy.slug}`}
            className="underline-offset-2 hover:underline"
          >
            /puppies/{puppy.slug}
          </Link>
        </p>
      </div>

      <form
        action={updatePuppy}
        className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6"
      >
        <input type="hidden" name="id" value={puppy.id} />
        <Field label="Name">
          <input name="name" required defaultValue={puppy.name} className={inputClass} />
        </Field>
        <Field label="Slug">
          <input name="slug" required defaultValue={puppy.slug} className={inputClass} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Sex">
            <select name="sex" required className={selectClass} defaultValue={puppy.sex}>
              <option value="FEMALE">Female</option>
              <option value="MALE">Male</option>
            </select>
          </Field>
          <Field label="Status">
            <select name="status" className={selectClass} defaultValue={puppy.status}>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
              <option value="GUARDIANSHIP">Guardianship</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </Field>
        </div>
        <Field label="Color">
          <input name="color" defaultValue={puppy.color ?? ""} className={inputClass} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Price (USD)">
            <input
              name="priceDollars"
              type="number"
              step="0.01"
              min="0"
              defaultValue={priceDollars}
              className={inputClass}
            />
          </Field>
          <Field label="Price label">
            <input
              name="priceLabel"
              defaultValue={puppy.priceLabel ?? ""}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Birth date">
          <input
            name="birthDate"
            type="date"
            defaultValue={birthValue}
            className={inputClass}
          />
        </Field>
        <Field label="Litter">
          <select
            name="litterId"
            className={selectClass}
            defaultValue={puppy.litterId ?? ""}
          >
            <option value="">No litter</option>
            {litters.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name ?? l.slug}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Description">
          <textarea
            name="description"
            defaultValue={puppy.description ?? ""}
            className={textareaClass}
          />
        </Field>
        <Field label="Sort order">
          <input
            name="sortOrder"
            type="number"
            defaultValue={puppy.sortOrder}
            className={inputClass}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={puppy.isPublished}
            className={checkClass}
          />
          Published on public site
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="isAdopted"
            defaultChecked={puppy.isAdopted}
            className={checkClass}
          />
          Adopted — show on Alumni (removes from main Puppies list)
        </label>
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" className={btnPrimary}>
            Save changes
          </button>
          <Link href="/admin/puppies" className={btnSecondary}>
            Cancel
          </Link>
        </div>
      </form>

      <PhotoManager
        entityType="PUPPY"
        entityId={puppy.id}
        photos={puppy.photos}
      />

      <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-black">Medical records</h2>
            <p className="mt-1 text-sm text-gray-500">
              Labeled PDFs and scans. Granted owners can view these in the
              customer portal document vault.
            </p>
          </div>
          <Link
            href={`/admin/medical/new?puppy=${puppy.id}`}
            className={btnPrimary}
          >
            Add record
          </Link>
        </div>
        {puppy.medicalRecords.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No medical records yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100">
            {puppy.medicalRecords.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
              >
                <div>
                  <Link
                    href={`/admin/medical/${r.id}`}
                    className="font-medium text-black hover:underline"
                  >
                    {r.title}
                  </Link>
                  <p className="text-xs text-gray-400">
                    {r.fileUrl ? "File attached" : "No file"}
                  </p>
                </div>
                <Link href={`/admin/medical/${r.id}`} className={btnSecondary}>
                  Open
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/admin/medical?puppy=${puppy.id}`}
          className="mt-4 inline-block text-sm text-gray-500 hover:text-black"
        >
          View all for this puppy →
        </Link>
      </section>

      <section id="owner-access" className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-black">
              Owner access (portal)
            </h2>
            <p className="mt-1 max-w-xl text-sm text-gray-500">
              Grant a customer access to this dog&apos;s medical documents in
              their portal. They must already have signed in once so their email
              exists in the system.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {puppy.medicalRecords.length} medical record
              {puppy.medicalRecords.length === 1 ? "" : "s"} will be visible
              after grant
              {puppy.medicalRecords.filter((r) => r.fileUrl).length
                ? ` (${puppy.medicalRecords.filter((r) => r.fileUrl).length} with files)`
                : ""}
              .
            </p>
          </div>
          <Link href="/admin/ownerships" className={btnSecondary}>
            All ownerships
          </Link>
        </div>

        {ownerFlash.ownerError ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {ownerFlash.ownerError}
          </p>
        ) : null}
        {ownerFlash.ownerGranted ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            Granted portal document access to{" "}
            <span className="font-medium">{ownerFlash.ownerGranted}</span>.
          </p>
        ) : null}
        {ownerFlash.ownerRevoked ? (
          <p className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            Owner access revoked.
          </p>
        ) : null}

        {puppy.ownerships.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            No owners linked yet.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100">
            {puppy.ownerships.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-black">
                    {o.user.name ?? o.user.email}
                  </p>
                  <p className="text-xs text-gray-500">{o.user.email}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Granted {formatDate(o.grantedAt) ?? "—"}
                    {o.notes ? ` · ${o.notes}` : ""}
                  </p>
                </div>
                <form action={revokeDogOwnership}>
                  <input type="hidden" name="ownershipId" value={o.id} />
                  <button type="submit" className={btnDanger}>
                    Revoke
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form
          action={grantDogOwnership}
          className="mt-6 space-y-4 border-t border-gray-100 pt-6"
        >
          <input type="hidden" name="puppyId" value={puppy.id} />
          <h3 className="text-sm font-semibold text-black">Grant access</h3>
          <Field
            label="Customer email"
            hint={
              grantSuggestions.length > 0
                ? "Must match their portal login. Suggestions include applicants/depositors for this puppy."
                : "Must match their portal login email (they must sign in once first)."
            }
          >
            <input
              name="email"
              type="email"
              required
              list={`owners-suggest-${puppy.id}`}
              placeholder="customer@example.com"
              className={inputClass}
            />
            {grantSuggestions.length > 0 ? (
              <datalist id={`owners-suggest-${puppy.id}`}>
                {grantSuggestions.map((u) => (
                  <option key={u.id} value={u.email}>
                    {u.name ?? u.email}
                  </option>
                ))}
              </datalist>
            ) : null}
          </Field>
          <Field label="Notes (admin only)">
            <input
              name="notes"
              placeholder="e.g. Placed 2026-07-01, paid in full"
              className={inputClass}
            />
          </Field>
          <button type="submit" className={btnPrimary}>
            Grant portal access
          </button>
        </form>
      </section>

      <form
        action={deletePuppy}
        className="mt-10 rounded-2xl border border-red-100 bg-white p-6"
      >
        <input type="hidden" name="id" value={puppy.id} />
        <h2 className="text-sm font-semibold text-red-800">Danger zone</h2>
        <p className="mt-1 text-sm text-gray-500">
          Permanently deletes this puppy and its photos.
        </p>
        <button type="submit" className={`${btnDanger} mt-4`}>
          Delete puppy
        </button>
      </form>
    </div>
  );
}
