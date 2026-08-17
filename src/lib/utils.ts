import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const currencyFormatters = new Map<string, Intl.NumberFormat>();

export function formatPrice(amount: number, currency = "XAF") {
  let formatter = currencyFormatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "XAF" ? 0 : 2,
    });
    currencyFormatters.set(currency, formatter);
  }
  return formatter.format(amount);
}

export function formatDate(value: string | Date, opts?: Intl.DateTimeFormatOptions) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...opts,
  }).format(date);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(value: string, max = 140) {
  if (value.length <= max) return value;
  return `${value.slice(0, max).trimEnd()}…`;
}

export function absoluteUrl(path: string, base: string) {
  return new URL(path, base).toString();
}

/**
 * Constrains a post-auth `next` destination to a same-site path.
 *
 * The sign-in form and the auth callback both take `next` from the URL and then
 * navigate to it. Left unchecked, a value like `@evil.com`, `//evil.com` or a
 * full `https://evil.com` sends the visitor off-site after login — an open
 * redirect, useful for phishing. Anything that is not a single-slash-rooted
 * path falls back to the dashboard.
 */
export function safeNextPath(next: string | null | undefined, fallback = "/admin") {
  if (!next) return fallback;
  // Must start with exactly one "/", ruling out "//host" and "/\\host", and
  // must not smuggle in a scheme or credentials.
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (next.includes("://") || next.includes("\\") || next.includes("@")) return fallback;
  return next;
}

/** Builds a wa.me deep link with a pre-filled message. */
export function whatsappLink(number: string, message: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

/**
 * A WhatsApp enquiry about a specific fabric, pre-filled with its name, a link
 * to its page, and optionally a colour and quantity the customer has chosen.
 * This is how the shop takes orders now — price is agreed in the chat.
 */
export function fabricEnquiryLink(opts: {
  number: string;
  siteUrl: string;
  name: string;
  slug: string;
  color?: string | null;
  quantity?: number;
  unit?: string;
  preorder?: boolean;
  depositPercent?: number;
}) {
  const url = `${opts.siteUrl.replace(/\/$/, "")}/shop/${opts.slug}`;
  const wants =
    opts.quantity && opts.unit
      ? ` I would like about ${opts.quantity} ${opts.unit}${opts.quantity > 1 ? "s" : ""}.`
      : "";
  const colour = opts.color ? ` in ${opts.color}` : "";
  const verb = opts.preorder ? "would like to pre-order" : "am interested in";
  const deposit = opts.preorder
    ? ` I understand a ${opts.depositPercent ?? 60}% deposit reserves it.`
    : "";
  const message = `Hello YADIMS, I ${verb} ${opts.name}${colour}.${wants}${deposit}\n${url}`;
  return whatsappLink(opts.number, message);
}

export function initialsOf(name: string | null | undefined) {
  if (!name) return "YF";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Paginates an in-memory list. Used by the fallback data layer. */
export function paginate<T>(items: T[], page: number, perPage: number) {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    total,
    page: current,
    perPage,
    pageCount,
  };
}
