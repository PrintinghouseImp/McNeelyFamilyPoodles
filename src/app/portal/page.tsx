export const metadata = {
  title: "My portal",
};

export default function PortalHomePage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight text-black">
        Welcome
      </h1>
      <p className="mt-2 max-w-2xl text-gray-500">
        After sign-in you can submit applications, request a deposit (Venmo,
        Zelle, or PayPal), and—once you have a dog—view your personal documents.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { href: "/portal/applications", label: "Applications" },
          { href: "/portal/deposits", label: "Deposit requests" },
          { href: "/portal/dogs", label: "My dogs & documents" },
        ].map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-gray-300 hover:shadow-sm"
          >
            <p className="font-medium text-black">{card.label}</p>
          </a>
        ))}
      </ul>
    </div>
  );
}
