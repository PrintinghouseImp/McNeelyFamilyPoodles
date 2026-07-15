import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import {
  formatDate,
  formatDepositMethod,
  formatDepositStatus,
  formatPriceCents,
} from "@/lib/format";
import { btnSecondary } from "@/components/admin/field";
import { DEPOSIT_STATUSES } from "@/lib/validations/deposit";

export const metadata = { title: "Admin · Deposits" };

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminDepositsPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  const statusFilter =
    params.status &&
    DEPOSIT_STATUSES.includes(params.status as (typeof DEPOSIT_STATUSES)[number])
      ? params.status
      : null;

  const deposits = await db.depositRequest.findMany({
    where: statusFilter ? { status: statusFilter as never } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      puppy: { select: { name: true } },
      user: { select: { email: true } },
    },
  });

  const counts = await db.depositRequest.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const countMap = Object.fromEntries(
    counts.map((c) => [c.status, c._count._all]),
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-black">
          Deposit requests
        </h1>
        <p className="mt-1 text-gray-500">
          Mark Venmo / Zelle / PayPal deposits as paid after you receive funds.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip href="/admin/deposits" active={!statusFilter} label="All" />
        {DEPOSIT_STATUSES.map((s) => (
          <FilterChip
            key={s}
            href={`/admin/deposits?status=${s}`}
            active={statusFilter === s}
            label={`${formatDepositStatus(s)}${
              countMap[s] != null ? ` (${countMap[s]})` : ""
            }`}
          />
        ))}
      </div>

      {deposits.length === 0 ? (
        <p className="text-gray-500">No deposit requests in this view.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Puppy</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deposits.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3">
                    <p className="font-medium text-black">{d.name}</p>
                    <p className="text-xs text-gray-500">{d.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDepositMethod(d.method)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatPriceCents(d.amountCents) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {d.puppy?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={d.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(d.createdAt, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/deposits/${d.id}`}
                      className={btnSecondary}
                    >
                      Review
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

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white"
          : "rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-300 hover:text-black"
      }
    >
      {label}
    </Link>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    REQUESTED: "bg-sky-50 text-sky-800 ring-sky-100",
    AWAITING_PAYMENT: "bg-amber-50 text-amber-900 ring-amber-100",
    PAID: "bg-emerald-50 text-emerald-800 ring-emerald-100",
    CANCELLED: "bg-gray-100 text-gray-600 ring-gray-200",
    REFUNDED: "bg-violet-50 text-violet-800 ring-violet-100",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        styles[status] ?? "bg-gray-50 text-gray-600 ring-gray-200"
      }`}
    >
      {formatDepositStatus(status)}
    </span>
  );
}
