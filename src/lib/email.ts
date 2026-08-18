import { Resend } from "resend";
import { SITE } from "@/lib/constants";
import { formatPriceCents } from "@/lib/format";
import { formatPaymentKind, getAppBaseUrl } from "@/lib/stripe";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getEmailFrom(): string {
  const from = process.env.EMAIL_FROM?.trim();
  if (from) return from;
  // Resend test sender works without a verified domain (sandbox).
  return `${SITE.name} <onboarding@resend.dev>`;
}

let resendSingleton: Resend | null = null;

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to .env to send payment emails.",
    );
  }
  if (!resendSingleton) {
    resendSingleton = new Resend(key);
  }
  return resendSingleton;
}

export type PaymentLinkEmailInput = {
  to: string;
  customerName?: string | null;
  checkoutUrl: string;
  kind: "DEPOSIT" | "FULL" | string;
  amountCents: number;
  puppyName?: string | null;
  description?: string | null;
};

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; skipped?: boolean };

/**
 * Email a Stripe Checkout link to the customer via Resend.
 */
export async function sendPaymentLinkEmail(
  input: PaymentLinkEmailInput,
): Promise<SendEmailResult> {
  const to = input.to.trim().toLowerCase();
  if (!to || !to.includes("@")) {
    return { ok: false, error: "Invalid customer email." };
  }
  if (!input.checkoutUrl?.startsWith("http")) {
    return { ok: false, error: "Missing checkout URL." };
  }

  if (!isEmailConfigured()) {
    console.warn(
      "[email] RESEND_API_KEY not set — payment link email skipped for",
      to,
    );
    return {
      ok: false,
      skipped: true,
      error:
        "Email not configured (RESEND_API_KEY). Link was created; copy it or set Resend to email customers.",
    };
  }

  const kindLabel = formatPaymentKind(input.kind);
  const amount = formatPriceCents(input.amountCents) ?? "the agreed amount";
  const puppyBit = input.puppyName ? ` for ${input.puppyName}` : "";
  const greeting = input.customerName?.trim()
    ? `Hi ${input.customerName.trim()},`
    : "Hello,";
  const portalUrl = `${getAppBaseUrl()}/portal/deposits`;
  const subject = `${kindLabel}${puppyBit} — ${SITE.name}`;

  const text = [
    greeting,
    "",
    `Please complete your ${kindLabel.toLowerCase()}${puppyBit} (${amount}) using the secure Stripe link below:`,
    "",
    input.checkoutUrl,
    "",
    input.description?.trim() ? `Note: ${input.description.trim()}` : null,
    "",
    `If you already have a customer account, you can also open the link from your portal:`,
    portalUrl,
    "",
    "If you did not expect this email, you can ignore it.",
    "",
    `— ${SITE.breeders}`,
    SITE.name,
    SITE.location,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, sans-serif; color: #111; line-height: 1.5; max-width: 560px;">
      <p>${escapeHtml(greeting)}</p>
      <p>Please complete your <strong>${escapeHtml(kindLabel.toLowerCase())}</strong>${
        input.puppyName
          ? ` for <strong>${escapeHtml(input.puppyName)}</strong>`
          : ""
      } (<strong>${escapeHtml(amount)}</strong>) using the secure Stripe Checkout link below.</p>
      <p style="margin: 28px 0;">
        <a href="${escapeAttr(input.checkoutUrl)}"
           style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;">
          Pay securely with card
        </a>
      </p>
      <p style="font-size:13px;color:#6b7280;word-break:break-all;">
        Or paste this URL:<br/>
        <a href="${escapeAttr(input.checkoutUrl)}" style="color:#111;">${escapeHtml(input.checkoutUrl)}</a>
      </p>
      ${
        input.description?.trim()
          ? `<p style="font-size:14px;color:#4b5563;">${escapeHtml(input.description.trim())}</p>`
          : ""
      }
      <p style="font-size:14px;color:#4b5563;">
        Signed-in customers can also find open payment links in the
        <a href="${escapeAttr(portalUrl)}" style="color:#111;">customer portal</a>.
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
      <p style="font-size:13px;color:#6b7280;">
        — ${escapeHtml(SITE.breeders)}<br/>
        ${escapeHtml(SITE.name)} · ${escapeHtml(SITE.location)}
      </p>
    </div>
  `.trim();

  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: getEmailFrom(),
      to: [to],
      subject,
      text,
      html,
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return {
        ok: false,
        error: error.message || "Resend failed to send the email.",
      };
    }

    return { ok: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email send failed.";
    console.error("[email]", message);
    return { ok: false, error: message };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, "&#39;");
}
