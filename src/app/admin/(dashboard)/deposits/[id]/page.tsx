import Link from "next/link";
import { notFound } from "next/navigation";
import { updateDepositStatus } from "@/app/actions/deposits";
import { startCheckoutForDeposit } from "@/app/admin/actions/payments";
import {
  btnPrimary,
  btnSecondary,
  selectClass,
  textareaClass,
  Field,
} from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import {
  formatDate,
  formatDepositMethod,
  formatDepositStatus,
  formatPriceCents,
} from "@/lib/format";
import { getPaymentHandles } from "@/lib/settings";
import {
  formatPaymentCheckoutStatus,
  isStripeConfigured,
} from "@/lib/stripe";
import { DEPOSIT_STATUSES } from "@/lib/validations/deposit";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const d = await db.depositRequest.findUnique({ where: { id } });
  return {
    title: d ? `Admin · Deposit · ${d.name}` : "Admin · Deposit",
  };
}

export default async function AdminDepositDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const [deposit, handles] = await Promise.all([
    db.depositRequest.findUnique({
      where: { id },
      include: {
        puppy: { select: { id: true, name: true, slug: true } },
        user: { select: { email: true, name: true } },
        stripePayment: true,
      },
    }),
    getPaymentHandles(),
  ]);
  if (!deposit) notFound();

  const stripeOk = isStripeConfigured();
  const handleHint =
    deposit.method === "VENMO"
      ? handles.venmo
      : deposit.method === "ZELLE"
        ? handles.zelle
        : deposit.method === "PAYPAL"
          ? handles.paypal
          : deposit.method === "STRIPE"
            ? "Stripe Checkout"
            : null;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/deposits"
        className="text-sm text-gray-500 hover:text-black"
      >
        ← All deposits
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black">
        {deposit.name}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {formatDepositStatus(deposit.status)} ·{" "}
        {formatDepositMethod(deposit.method)}
        {handleHint ? ` · your handle: ${handleHint}` : null}
      </p>

      <dl className="mt-8 grid gap-4 rounded-2xl border border-gray-200 bg-white p-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-400">Email</dt>
          <dd className="mt-1 text-sm text-black">{deposit.email}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-400">Phone</dt>
          <dd className="mt-1 text-sm text-black">{deposit.phone ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-400">
            Amount
          </dt>
          <dd className="mt-1 text-sm text-black">
            {formatPriceCents(deposit.amountCents) ?? "Not specified"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-400">
            Method
          </dt>
          <dd className="mt-1 text-sm text-black">
            {formatDepositMethod(deposit.method)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-400">
            Puppy
          </dt>
          <dd className="mt-1 text-sm text-black">
            {deposit.puppy ? (
              <Link
                href={`/admin/puppies/${deposit.puppy.id}`}
                className="hover:underline"
              >
                {deposit.puppy.name}
              </Link>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-400">
            Submitted
          </dt>
          <dd className="mt-1 text-sm text-black">
            {formatDate(deposit.createdAt) ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-400">
            Paid at
          </dt>
          <dd className="mt-1 text-sm text-black">
            {formatDate(deposit.paidAt) ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-gray-400">
            Account
          </dt>
          <dd className="mt-1 text-sm text-black">
            {deposit.user?.email ?? deposit.user?.name ?? "—"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs uppercase tracking-wide text-gray-400">
            Customer note
          </dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
            {deposit.customerNote?.trim() || "—"}
          </dd>
        </div>
      </dl>

      {stripeOk &&
      deposit.status !== "PAID" &&
      deposit.status !== "CANCELLED" &&
      deposit.status !== "REFUNDED" ? (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-black">
            Stripe Checkout
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Generate or refresh a card payment link for this deposit
            {deposit.amountCents
              ? ` (${formatPriceCents(deposit.amountCents)})`
              : " — set amount on the request first"}
            .
          </p>
          {deposit.stripePayment ? (
            <p className="mt-2 text-sm text-gray-600">
              Linked session:{" "}
              {formatPaymentCheckoutStatus(deposit.stripePayment.status)}
              {deposit.stripePayment.checkoutUrl &&
              deposit.stripePayment.status === "OPEN" ? (
                <>
                  {" · "}
                  <a
                    href={deposit.stripePayment.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline-offset-2 hover:underline"
                  >
                    Open link
                  </a>
                </>
              ) : null}
            </p>
          ) : null}
          {deposit.amountCents != null && deposit.amountCents >= 50 ? (
            <div className="mt-4 space-y-3">
              <form action={startCheckoutForDeposit} className="space-y-3">
                <input
                  type="hidden"
                  name="depositRequestId"
                  value={deposit.id}
                />
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="sendEmail"
                    value="1"
                    defaultChecked
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Email link to {deposit.email}
                </label>
                <button type="submit" className={btnPrimary}>
                  {deposit.stripePayment?.status === "OPEN"
                    ? "Refresh Stripe link & open"
                    : "Create Stripe Checkout for deposit"}
                </button>
              </form>
            </div>
          ) : (
            <p className="mt-3 text-sm text-amber-800">
              Amount is required (at least $0.50) before creating Checkout.
              Use{" "}
              <Link
                href="/admin/payments"
                className="font-medium underline-offset-2 hover:underline"
              >
                Stripe payments
              </Link>{" "}
              to create a custom-amount session and link the customer.
            </p>
          )}
        </div>
      ) : null}

      <form
        action={updateDepositStatus}
        className="mt-8 space-y-4 rounded-2xl border border-gray-200 bg-white p-6"
      >
        <input type="hidden" name="id" value={deposit.id} />
        <h2 className="text-lg font-semibold text-black">Update status</h2>
        <p className="text-sm text-gray-500">
          After you see person-to-person funds (or Stripe marks the session
          paid), set status to{" "}
          <strong className="font-medium text-gray-700">Paid</strong>. Card
          payments usually update automatically via webhook / success page.
        </p>
        <Field label="Status">
          <select
            name="status"
            className={selectClass}
            defaultValue={deposit.status}
          >
            {DEPOSIT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {formatDepositStatus(s)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Admin note" hint="Internal only">
          <textarea
            name="adminNote"
            className={textareaClass}
            rows={3}
            defaultValue={deposit.adminNote ?? ""}
            placeholder="e.g. Received $500 via Venmo 3/12"
          />
        </Field>
        <div className="flex flex-wrap gap-3">
          <SubmitButton pendingLabel="Saving…">Save status</SubmitButton>
          <Link href="/admin/deposits" className={btnSecondary}>
            Back to list
          </Link>
        </div>
      </form>
    </div>
  );
}
