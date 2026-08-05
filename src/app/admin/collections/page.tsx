import type { Metadata } from "next";

import { getAdminCollections, getAdminProducts } from "@/lib/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TaxonomyGrid } from "@/components/admin/taxonomy-grid";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Collections" };

export default async function AdminCollectionsPage() {
  const [collections, products] = await Promise.all([getAdminCollections(), getAdminProducts()]);

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Collections"
        description="Collections group fabric by what it is for rather than what it is made of — this is what customers actually shop by."
      />
      <TaxonomyGrid
        items={collections.map((collection) => ({
          id: collection.id,
          name: collection.name,
          slug: collection.slug,
          description: collection.tagline,
          image: collection.cover_image_url,
          count: products.filter((p) => p.collection_id === collection.id).length,
          featured: collection.is_featured,
          href: `/collections/${collection.slug}`,
        }))}
        emptyMessage="No collections yet."
      />
    </div>
  );
}
