import type { PaymentHandles } from "@/lib/settings";
import { hasAnyPaymentHandle } from "@/lib/settings";

export function PaymentHandlesCard({ handles }: { handles: PaymentHandles }) {
  if (!hasAnyPaymentHandle(handles)) {
    return (
      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Payment handles are not configured yet. You can still submit a request;
        the breeder will share Venmo / Zelle / PayPal details by email.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-sm">
      <p className="font-medium text-black">Send payment to</p>
      <p className="mt-1 text-gray-500">
        After you submit this request, send funds using the method you chose.
        The breeder will mark your deposit as paid when they receive it.
      </p>
      <ul className="mt-4 space-y-2 text-gray-700">
        {handles.venmo ? (
          <li>
            <span className="text-gray-400">Venmo · </span>
            <span className="font-medium text-black">{handles.venmo}</span>
          </li>
        ) : null}
        {handles.zelle ? (
          <li>
            <span className="text-gray-400">Zelle · </span>
            <span className="font-medium text-black">{handles.zelle}</span>
          </li>
        ) : null}
        {handles.paypal ? (
          <li>
            <span className="text-gray-400">PayPal · </span>
            <a
              href={
                handles.paypal.startsWith("http")
                  ? handles.paypal
                  : `https://paypal.me/${handles.paypal.replace(/^@/, "")}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-black hover:underline"
            >
              {handles.paypal}
            </a>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
