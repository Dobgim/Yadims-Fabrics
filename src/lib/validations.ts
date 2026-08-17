import { z } from "zod";

/**
 * Honeypot. A hidden field no human fills in; a bot that fills every input
 * trips it. The forms render it off-screen with autocomplete off, and the
 * server rejects any submission where it is non-empty. Cheap, dependency-free
 * spam suppression — not a substitute for a real CAPTCHA under determined
 * abuse, but it stops the drive-by bots that submit every form they find.
 */
export const HONEYPOT_FIELD = "company_website";
// Must be empty. A real person never sees or fills this; a bot that fills every
// field submits a value, and `.max(0)` then rejects the whole submission.
const honeypot = z.string().max(0, "Rejected").optional().or(z.literal(""));

export const newsletterSchema = z.object({
  // Every public field is bounded so a single request cannot ship megabytes
  // into the database. An email is never longer than this.
  email: z.string().email("Enter a valid email address").max(200),
  source: z.string().max(60).default("footer"),
  [HONEYPOT_FIELD]: honeypot,
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, "Please tell us your name").max(120),
  email: z.string().email("Enter a valid email address").max(200),
  phone: z
    .string()
    .max(40)
    .optional()
    .or(z.literal("")),
  subject: z.string().min(3, "A short subject helps us route your message").max(200),
  message: z
    .string()
    .min(20, "Please give us a little more detail (20 characters minimum)")
    .max(4000, "That is longer than our form accepts — please trim it or use WhatsApp"),
  [HONEYPOT_FIELD]: honeypot,
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

// =====================================================================
// Admin editors
//
// These parse `FormData`, so every value arrives as a string. The helpers
// below turn the empty string — what an untouched input actually submits —
// into `null` rather than letting it through as "", which would write empty
// strings into nullable columns and show up as blank lines on the storefront.
// =====================================================================

/** Trims, then maps "" to null. For nullable text columns. */
const optionalText = (max = 2000) =>
  z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z.string().max(max).nullish().transform((v) => (v ? v : null)),
  );

/** Trims, then maps "" and absent to null. For nullable numeric columns. */
const optionalNumber = z.preprocess(
  (v) => (v === undefined || v === null || (typeof v === "string" && v.trim() === "") ? null : v),
  z.coerce.number().min(0, "Cannot be negative").nullable(),
);

/**
 * Comma- or newline-separated free text into a clean array. Used for colours
 * and tags, which are `text[]` in Postgres.
 */
const textList = z.preprocess((v) => {
  if (Array.isArray(v)) return v;
  if (typeof v !== "string") return [];
  return v
    .split(/[,\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}, z.array(z.string().min(1).max(60)).max(40));

/**
 * Image URLs arrive as repeated `images` fields, one per uploaded file, in the
 * order the uploader shows them. A single value arrives as a bare string.
 */
const imageList = z.preprocess((v) => {
  if (Array.isArray(v)) return v.filter(Boolean);
  if (typeof v === "string" && v) return [v];
  return [];
}, z.array(z.string().min(1)).max(12));

/** Same shape as `imageList`, for the product's uploaded video clips. */
const videoList = z.preprocess((v) => {
  if (Array.isArray(v)) return v.filter(Boolean);
  if (typeof v === "string" && v) return [v];
  return [];
}, z.array(z.string().min(1)).max(6));

/** HTML form checkboxes submit "on" when ticked and nothing at all when not. */
const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());

/**
 * Optional. Left blank, the server builds one from the name — nobody should
 * have to invent a URL to add a bolt of cloth. Validated only when something
 * was actually typed, so a bad hand-written slug is still caught.
 */
const slugField = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z
    .string()
    .trim()
    .max(90)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only")
    .optional(),
);

export const productSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  name: z.string().trim().min(2, "Give the fabric a name"),
  slug: slugField,
  sku: optionalText(40),
  short_description: optionalText(200),
  description: optionalText(6000),
  // Prices are agreed with the customer over WhatsApp and are not shown on the
  // site, so the editor no longer asks for one. The column stays (NOT NULL) and
  // defaults to 0 for any row the form does not set.
  price: z.coerce.number().min(0).default(0),
  compare_at_price: optionalNumber,
  currency: z.string().trim().min(3).max(3).default("XAF"),
  unit: z.string().trim().min(1).max(20).default("yard"),
  material: optionalText(80),
  width_cm: optionalNumber,
  weight_gsm: optionalNumber,
  care_instructions: optionalText(500),
  origin: optionalText(80),
  colors: textList,
  tags: textList,
  images: imageList,
  videos: videoList,
  stock_quantity: z.coerce.number().int().min(0, "Stock cannot be negative").default(0),
  min_order_quantity: z.coerce.number().int().min(1, "Minimum order is at least 1").default(1),
  category_id: z.preprocess((v) => (v ? v : null), z.string().uuid().nullable()),
  collection_id: z.preprocess((v) => (v ? v : null), z.string().uuid().nullable()),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  is_featured: checkbox,
  is_new_arrival: checkbox,
  // Pre-order: cloth brought in to order, reserved with a deposit. The percent
  // is bounded to a sane range and defaults to the house's usual 60%.
  is_preorder: checkbox,
  preorder_deposit_percent: z.coerce
    .number()
    .int()
    .min(1, "A deposit is at least 1%")
    .max(100, "A deposit cannot exceed 100%")
    .default(60),
});
export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  name: z.string().trim().min(2, "Give the category a name"),
  slug: slugField,
  description: optionalText(600),
  image_url: optionalText(600),
  position: z.coerce.number().int().min(0).default(0),
  is_featured: checkbox,
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const collectionSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  name: z.string().trim().min(2, "Give the collection a name"),
  slug: slugField,
  tagline: optionalText(160),
  description: optionalText(1200),
  cover_image_url: optionalText(600),
  accent_image_url: optionalText(600),
  position: z.coerce.number().int().min(0).default(0),
  is_featured: checkbox,
});
export type CollectionInput = z.infer<typeof collectionSchema>;

export const galleryItemSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(2, "Give the photograph a title"),
  caption: optionalText(300),
  image_url: z.string().trim().min(1, "Upload an image first"),
  category: z.string().trim().min(1).max(40).default("Store"),
  aspect: z.enum(["portrait", "landscape", "square"]).default("portrait"),
  position: z.coerce.number().int().min(0).default(0),
  is_published: checkbox,
});
export type GalleryItemInput = z.infer<typeof galleryItemSchema>;

export const postSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(4, "Give the article a title"),
  slug: slugField,
  excerpt: optionalText(320),
  content: z.string().trim().min(50, "An article needs at least a paragraph"),
  cover_image_url: optionalText(600),
  category: z.string().trim().min(1).max(40).default("Fabric Care"),
  tags: textList,
  author_name: z.string().trim().min(2).max(80).default("YADIMS Editorial"),
  read_minutes: z.coerce.number().int().min(1).max(60).default(4),
  status: z.enum(["draft", "published"]).default("draft"),
});
export type PostInput = z.infer<typeof postSchema>;
