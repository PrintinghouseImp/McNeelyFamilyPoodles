export const metadata = {
  title: "Admin Dashboard",
};

const placeholders = [
  { label: "Available puppies", value: "—" },
  { label: "New inquiries", value: "—" },
  { label: "Applications", value: "—" },
  { label: "Waitlist", value: "—" },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-black">
        Dashboard
      </h1>
      <p className="mb-10 text-gray-500">
        Counts will query PostgreSQL once migrations are applied.
      </p>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {placeholders.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-200 bg-white p-6"
          >
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-black">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
