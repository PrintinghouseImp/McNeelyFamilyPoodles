import Link from "next/link";
import { requirePortalUser } from "@/lib/portal";
import { db } from "@/lib/db";
import {
  formatDate,
  formatDepositMethod,
  formatDepositStatus,
  formatPriceCents,
} from "@/lib/format";
import { getPaymentHandles } from "@/lib/settings";
import { PaymentHandlesCard } from "@/components/deposits/payment-handles";

export const metadata = { title: "Deposit requests" };

type Props = {
  searchParams: Promise<{ submitted?: string }>;
};

export default async function PortalDepositsPage({ searchParams }: Props) {
  const session = await requirePortalUser();
  const params = await searchParams;

  const [deposits, handles] = await Promise.all([
    db.depositRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        puppy: { select: { name: true, slug: true } },
      },
    }),
    getPaymentHandles(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            Deposit requests
          </h1>
          <p className="mt-2 max-w-2xl text-gray-500">
            Request a reservation deposit via Venmo, Zelle, or PayPal. Payment
            is person-to-person; the breeder confirms when funds arrive.
          </p>
        </div>
        <Link
          href="/portal/deposits/new"
          className="inline-flex rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-900"
        >
          New request
        </Link>
      </div>

      {params.submitted === "1" ? (
        <p
          className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          Deposit request submitted. Send payment using the handles below if
          you have not already, then wait for the breeder to confirm.
        </p>
      ) : null}

      <div className="mt-8">
        <PaymentHandlesCard handles={handles} />
      </div>

      {deposits.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No deposit requests yet.</p>
          <Link
            href="/portal/deposits/new"
            className="mt-4 inline-flex rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-900"
          >
            Request a deposit
          </Link>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
          {deposits.map((d) => (
            <li key={d.id} className="px-5 py-4 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium text-black">
                  {d.puppy?.name ?? "Deposit request"} ·{" "}
                  {formatDepositMethod(d.method)}
                </p>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                  {formatDepositStatus(d.status)}
                </span>
              </div>
              <p className="mt-1 text-gray-500">
                {formatPriceCents(d.amountCents) ?? "Amount TBD"}
                {" · "}
                {formatDate(d.createdAt) ?? "—"}
                {d.paidAt
                  ? ` · Paid ${formatDate(d.paidAt) ?? ""}`.trim()
                  : null}
              </p>
              {d.customerNote ? (
                <p className="mt-2 line-clamp-2 text-gray-600">{d.customerNote}</p>
              ) : null}
              {d.puppy?.slug ? (
                <Link
                  href={`/puppies/${d.puppy.slug}`}
                  className="mt-2 inline-block text-xs text-gray-500 hover:text-black"
                >
                  View puppy →
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
