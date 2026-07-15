import Link from "next/link";
import { notFound } from "next/navigation";
import { updateApplicationStatus } from "@/app/actions/applications";
import {
  btnPrimary,
  btnSecondary,
  selectClass,
  Field,
} from "@/components/admin/field";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import {
  formatApplicationStatus,
  formatDate,
} from "@/lib/format";
import { APPLICATION_STATUSES } from "@/lib/validations/application";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const app = await db.application.findUnique({ where: { id } });
  return {
    title: app ? `Admin · Application · ${app.name}` : "Admin · Application",
  };
}

export default async function AdminApplicationDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const app = await db.application.findUnique({
    where: { id },
    include: {
      puppy: { select: { id: true, name: true, slug: true, status: true } },
      user: { select: { id: true, email: true, name: true } },
    },
  });
  if (!app) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/applications"
        className="text-sm text-gray-500 hover:text-black"
      >
        ← All applications
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black">
        {app.name}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {formatApplicationStatus(app.status)} · Submitted{" "}
        {formatDate(app.createdAt) ?? "—"}
      </p>

      <dl className="mt-8 grid gap-4 rounded-2xl border border-gray-200 bg-white p-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-400">Email</dt>
          <dd className="mt-1 text-sm text-black">{app.email}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-400">Phone</dt>
          <dd className="mt-1 text-sm text-black">{app.phone ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-400">
            Account
          </dt>
          <dd className="mt-1 text-sm text-black">
            {app.user?.email ?? app.user?.name ?? "Linked account"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-400">
            Puppy
          </dt>
          <dd className="mt-1 text-sm text-black">
            {app.puppy ? (
              <Link
                href={`/admin/puppies/${app.puppy.id}`}
                className="hover:underline"
              >
                {app.puppy.name}
              </Link>
            ) : (
              "General (no specific puppy)"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-400">
            Home type
          </dt>
          <dd className="mt-1 text-sm text-black">{app.homeType ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-400">
            Household
          </dt>
          <dd className="mt-1 text-sm text-black">
            Kids: {app.hasKids == null ? "—" : app.hasKids ? "Yes" : "No"}
            {" · "}
            Pets: {app.hasPets == null ? "—" : app.hasPets ? "Yes" : "No"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs uppercase tracking-wide text-gray-400">
            Message
          </dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
            {app.message?.trim() || "—"}
          </dd>
        </div>
      </dl>

      <form
        action={updateApplicationStatus}
        className="mt-8 space-y-4 rounded-2xl border border-gray-200 bg-white p-6"
      >
        <input type="hidden" name="id" value={app.id} />
        <h2 className="text-lg font-semibold text-black">Update status</h2>
        <Field label="Status">
          <select
            name="status"
            className={selectClass}
            defaultValue={app.status}
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {formatApplicationStatus(s)}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className={btnPrimary}>
            Save status
          </button>
          <Link href="/admin/applications" className={btnSecondary}>
            Back to list
          </Link>
        </div>
      </form>
    </div>
  );
}
