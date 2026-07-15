import Link from "next/link";
import { DepositForm } from "@/components/deposits/deposit-form";
import { PaymentHandlesCard } from "@/components/deposits/payment-handles";
import { requirePortalUser } from "@/lib/portal";
import { db } from "@/lib/db";
import { formatPuppyStatus } from "@/lib/format";
import { getPaymentHandles } from "@/lib/settings";

export const metadata = { title: "New deposit request" };

type Props = {
  searchParams: Promise<{ puppy?: string }>;
};

export default async function NewDepositPage({ searchParams }: Props) {
  const session = await requirePortalUser();
  const params = await searchParams;
  const puppySlug = params.puppy?.trim();

  const [puppies, selected, handles] = await Promise.all([
    db.puppy.findMany({
      where: {
        isPublished: true,
        status: { in: ["AVAILABLE", "GUARDIANSHIP", "RESERVED"] },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, status: true },
    }),
    puppySlug
      ? db.puppy.findFirst({
          where: { slug: puppySlug, isPublished: true },
          select: { id: true, name: true },
        })
      : null,
    getPaymentHandles(),
  ]);

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/portal/deposits"
        className="text-sm text-gray-500 hover:text-black"
      >
        ← Deposit requests
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black">
        Request a deposit
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Choose a payment method and optional amount. This records your intent;
        you still send Venmo / Zelle / PayPal yourself.
      </p>

      <div className="mt-6">
        <PaymentHandlesCard handles={handles} />
      </div>

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
        <DepositForm
          handles={handles}
          defaultPuppyId={selected?.id}
          defaultName={session.user.name ?? undefined}
          defaultEmail={session.user.email ?? undefined}
          puppies={puppies.map((p) => ({
            id: p.id,
            name: p.name,
            status: formatPuppyStatus(p.status),
          }))}
        />
      </div>
    </div>
  );
}
