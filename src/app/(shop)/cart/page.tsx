import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your cut lengths before checkout.",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <>
      <PageHeader
        eyebrow="Almost there"
        title="Your cart"
        description="Check the colours and lengths before you go through. If you need a length adjusted after ordering, message us — we cut by hand and there is usually time."
        breadcrumbs={[{ name: "Cart", href: "/cart" }]}
      />

      <section className="section">
        <div className="container">
          <CartView />
        </div>
      </section>
    </>
  );
}
