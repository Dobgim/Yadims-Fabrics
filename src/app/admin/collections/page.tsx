import type { Metadata } from "next";

import { getAdminCollections, getAdminProducts } from "@/lib/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";

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
      <TaxonomyManager
        kind="collection"
        records={collections.map((collection) => ({
          row: collection,
          count: products.filter((p) => p.collection_id === collection.id).length,
        }))}
      />
    </div>
  );
}
