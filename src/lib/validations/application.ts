import { z } from "zod";

export const puppyApplicationSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  message: z.string().max(5000).optional().or(z.literal("")),
  homeType: z.string().max(80).optional().or(z.literal("")),
  hasKids: z.boolean().optional(),
  hasPets: z.boolean().optional(),
  puppyId: z.string().cuid().optional(),
});

export const waitlistSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  preferences: z.string().max(2000).optional().or(z.literal("")),
});

export type PuppyApplicationInput = z.infer<typeof puppyApplicationSchema>;
export type WaitlistInput = z.infer<typeof waitlistSchema>;
