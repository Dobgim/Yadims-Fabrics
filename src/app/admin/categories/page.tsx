import type { Metadata } from "next";

import { getAdminCategories, getAdminProducts } from "@/lib/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TaxonomyGrid } from "@/components/admin/taxonomy-grid";

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
      <TaxonomyGrid
        items={categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image_url,
          count: products.filter((p) => p.category_id === category.id).length,
          featured: category.is_featured,
          href: `/shop?category=${category.slug}`,
        }))}
        emptyMessage="No categories yet."
      />
    </div>
  );
}
