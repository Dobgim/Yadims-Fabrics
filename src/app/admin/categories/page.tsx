import type { Metadata } from "next";

import { getAdminCategories, getAdminProducts } from "@/lib/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([getAdminCategories(), getAdminProducts()]);

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Categories"
        description="How the shop filters group fabric by fibre and construction. Order here controls order on the storefront."
      />
      <TaxonomyManager
        kind="category"
        records={categories.map((category) => ({
          row: category,
          count: products.filter((p) => p.category_id === category.id).length,
        }))}
      />
    </div>
  );
}
