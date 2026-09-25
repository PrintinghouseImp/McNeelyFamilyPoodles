import { z } from "zod";

export const rescueApplicationSchema = z.object({
  organizationName: z.string().trim().min(2).max(160),
  website: z.string().trim().url().max(300),
  ein: z
    .string()
    .trim()
    .min(9)
    .max(12)
    .regex(/^[0-9-]+$/, "Enter the EIN with digits"),
  confirms501c3: z.literal(true, {
    error: "Confirm that the organization is a 501(c)(3).",
  }),
  focus: z.string().trim().min(2).max(5000),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
});

export type RescueApplicationInput = z.infer<typeof rescueApplicationSchema>;
