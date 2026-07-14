export const metadata = {
  title: "Admin Login",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="mb-1 text-xs uppercase tracking-widest text-gray-400">
          Admin
        </p>
        <h1 className="mb-2 text-3xl font-semibold tracking-tight text-black">
          Breeder admin
        </h1>
        <p className="mb-8 text-sm text-gray-500">
          Email and password sign-in for inventory, medical records, photos, and
          applications. Separate from the customer portal.
        </p>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Add / edit / remove dogs</li>
          <li>• Status, specs, price</li>
          <li>• Camera photo upload (hero + gallery)</li>
          <li>• Medical records (admin only)</li>
        </ul>
      </div>
    </div>
  );
}
