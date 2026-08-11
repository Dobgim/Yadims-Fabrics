import type { Metadata } from "next";

import { galleryCategories } from "@/data/content";
import { getGalleryItems } from "@/lib/queries/content";
import { PageHeader } from "@/components/shared/page-header";
import { MasonryGallery } from "@/components/gallery/masonry-gallery";
import { ContactBanner } from "@/components/shared/contact-banner";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Inside the YADIMS shop — the bolt wall, fabric displays, new stock arrivals, trunk shows and finished pieces made by our customers.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <>
      <PageHeader
        eyebrow="Inside the shop"
        title="Gallery"
        description="The bolt wall, the lace table, delivery days, and the pieces our customers have made. Photographed as it is, not as a catalogue would like it to look."
        breadcrumbs={[{ name: "Gallery", href: "/gallery" }]}
      />

      <section className="section">
        <div className="container">
          <MasonryGallery items={items} categories={galleryCategories} />
        </div>
      </section>

      <ContactBanner />
    </>
  );
}
