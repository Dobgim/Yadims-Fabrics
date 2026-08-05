/**
 * Shipping rules, kept in one place so the cart, the checkout summary and the
 * order record can never disagree about what a customer owes.
 */
export const FREE_DELIVERY_THRESHOLD = 50_000;
export const DELIVERY_FEE_LOCAL = 2_500;
export const DELIVERY_FEE_NATIONAL = 4_500;

/** The shop's own city — free and reduced-rate delivery apply here. */
export const HOME_CITY = "Yaoundé";

/**
 * Accepted spellings of the home city. Customers type this by hand, so the
 * accented form, the plain form and common misspellings all have to match or
 * they are silently charged the national rate.
 */
const HOME_CITY_ALIASES = ["yaoundé", "yaounde", "yaonde", "yde"];

export type DeliveryMethod = "delivery" | "collection";

export function isHomeCity(city: string): boolean {
  return HOME_CITY_ALIASES.includes(city.trim().toLowerCase());
}

export function calculateShipping(
  subtotal: number,
  city: string,
  method: DeliveryMethod = "delivery",
): number {
  if (method === "collection") return 0;

  const local = isHomeCity(city);
  if (local && subtotal >= FREE_DELIVERY_THRESHOLD) return 0;

  return local ? DELIVERY_FEE_LOCAL : DELIVERY_FEE_NATIONAL;
}

export function calculateTotals(subtotal: number, shipping: number, discount = 0) {
  return {
    subtotal,
    shipping,
    discount,
    total: Math.max(0, subtotal + shipping - discount),
  };
}

export const paymentMethods = [
  {
    value: "cash_on_delivery",
    label: "Cash on delivery",
    hint: "Pay the courier when the fabric arrives. Yaoundé and Douala only.",
  },
  {
    value: "mobile_money",
    label: "Mobile Money",
    hint: "MTN MoMo or Orange Money. We send the request once the cut is confirmed.",
  },
  {
    value: "bank_transfer",
    label: "Bank transfer",
    hint: "For wholesale and larger orders. Account details follow by email.",
  },
] as const;
