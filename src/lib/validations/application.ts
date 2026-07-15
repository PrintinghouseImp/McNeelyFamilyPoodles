import { z } from "zod";

export const APPLICATION_STATUSES = [
  "NEW",
  "REVIEWING",
  "APPROVED",
  "DECLINED",
  "WAITLISTED",
] as const;

export type ApplicationStatusValue = (typeof APPLICATION_STATUSES)[number];

export const puppyApplicationSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  message: z.string().max(5000).optional().or(z.literal("")),
  homeType: z.string().max(80).optional().or(z.literal("")),
  hasKids: z.boolean().optional(),
  hasPets: z.boolean().optional(),
  /** Puppy id (cuid) or empty for general waitlist-style application */
  puppyId: z.string().min(1).optional().or(z.literal("")),
});

export const applicationStatusSchema = z.enum(APPLICATION_STATUSES);

export type PuppyApplicationInput = z.infer<typeof puppyApplicationSchema>;
