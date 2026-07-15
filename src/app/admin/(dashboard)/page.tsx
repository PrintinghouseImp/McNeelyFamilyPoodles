import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [
    availablePuppies,
    totalPuppies,
    parents,
    litters,
    applications,
    deposits,
    ownerships,
  ] = await Promise.all([
    db.puppy.count({
      where: { status: "AVAILABLE", isPublished: true },
    }),
    db.puppy.count(),
    db.parentDog.count(),
    db.litter.count(),
    db.application.count({ where: { status: "NEW" } }),
    db.depositRequest.count({
      where: { status: { in: ["REQUESTED", "AWAITING_PAYMENT"] } },
    }),
    db.dogOwnership.count(),
  ]);

  const cards = [
    { label: "Available puppies", value: availablePuppies, href: "/admin/puppies" },
    { label: "All puppies", value: totalPuppies, href: "/admin/puppies" },
    { label: "Sires & dams", value: parents, href: "/admin/parents" },
    { label: "Litters", value: litters, href: "/admin/litters" },
    { label: "New applications", value: applications, href: "/admin/applications" },
    { label: "Open deposits", value: deposits, href: "/admin/deposits" },
    { label: "Owner grants", value: ownerships, href: "/admin/ownerships" },
  ];

  return (
    <div>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-black">
        Dashboard
      </h1>
      <p className="mb-10 text-gray-500">
        Manage inventory, medical records, applications, deposits, and owner
        document access from one place.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-gray-300 hover:shadow-sm"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-black">
              {card.value}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
