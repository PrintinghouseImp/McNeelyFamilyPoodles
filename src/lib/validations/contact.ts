import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  email: z.string().email("Valid email required"),
  phone: z.string().max(40).optional().or(z.literal("")),
  subject: z.string().max(200).optional().or(z.literal("")),
  message: z.string().min(10, "Please include a short message").max(5000),
});

export type ContactInput = z.infer<typeof contactSchema>;
