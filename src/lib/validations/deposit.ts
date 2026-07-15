import { z } from "zod";

export const DEPOSIT_METHODS = ["VENMO", "ZELLE", "PAYPAL"] as const;
export const DEPOSIT_STATUSES = [
  "REQUESTED",
  "AWAITING_PAYMENT",
  "PAID",
  "CANCELLED",
  "REFUNDED",
] as const;

export type DepositMethodValue = (typeof DEPOSIT_METHODS)[number];
export type DepositStatusValue = (typeof DEPOSIT_STATUSES)[number];

export const depositRequestSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  method: z.enum(DEPOSIT_METHODS),
  /** Dollars as string from form, e.g. "500" or "500.00" */
  amountDollars: z.string().optional().or(z.literal("")),
  customerNote: z.string().max(5000).optional().or(z.literal("")),
  puppyId: z.string().min(1).optional().or(z.literal("")),
});

export const depositStatusSchema = z.enum(DEPOSIT_STATUSES);

export type DepositRequestInput = z.infer<typeof depositRequestSchema>;
