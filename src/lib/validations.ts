import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  source: z.string().default("footer"),
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, "Please tell us your name"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .max(24)
    .optional()
    .or(z.literal("")),
  subject: z.string().min(3, "A short subject helps us route your message"),
  message: z.string().min(20, "Please give us a little more detail (20 characters minimum)"),
});
export type ContactInput = z.infer<typeof contactSchema>;

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Passwords are at least 8 characters"),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Please enter your full name"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string(),
    marketingOptIn: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type SignUpInput = z.infer<typeof signUpSchema>;

export const resetRequestSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const addressSchema = z.object({
  label: z.string().min(1).default("Home"),
  fullName: z.string().min(2, "Recipient name is required"),
  phone: z.string().min(6, "A reachable phone number is required"),
  line1: z.string().min(4, "Street address is required"),
  line2: z.string().optional().or(z.literal("")),
  city: z.string().min(2, "City is required"),
  region: z.string().optional().or(z.literal("")),
  country: z.string().min(2).default("Cameroon"),
  postalCode: z.string().optional().or(z.literal("")),
});
export type AddressInput = z.infer<typeof addressSchema>;

export const checkoutSchema = addressSchema.extend({
  email: z.string().email("Enter a valid email address"),
  paymentMethod: z.enum(["cash_on_delivery", "mobile_money", "bank_transfer"]),
  deliveryMethod: z.enum(["delivery", "collection"]),
  notes: z.string().max(500).optional().or(z.literal("")),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const profileSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  phone: z.string().max(24).optional().or(z.literal("")),
  marketingOptIn: z.boolean().default(false),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(80).optional().or(z.literal("")),
  body: z.string().min(20, "Please write at least 20 characters"),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

/** Uniform shape returned by every Server Action in this project. */
export type ActionResult<T = undefined> =
  | { ok: true; message: string; data?: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };
