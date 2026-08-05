import type { Metadata } from "next";

import { getAllProducts } from "@/lib/queries/products";
import { PageHeader } from "@/components/shared/page-header";
import { WishlistView } from "@/components/shop/wishlist-view";
import { ContactBanner } from "@/components/shared/contact-banner";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Fabrics you have saved for later.",
  robots: { index: false, follow: true },
};

export default async function WishlistPage() {
  // The wishlist is stored client-side as ids; the catalogue is resolved here
  // on the server so the client never has to fetch product data.
  const products = await getAllProducts();

  return (
    <>
      <PageHeader
        eyebrow="Saved for later"
        title="Your wishlist"
        description="Fabrics you have set aside. Stock moves — if something here matters, tell us and we will hold a length against your name."
        breadcrumbs={[{ name: "Wishlist", href: "/wishlist" }]}
      />

      <section className="section">
        <div className="container">
          <WishlistView products={products} />
        </div>
      </section>

      <ContactBanner />
    </>
  );
}
