import type { Metadata } from "next";

import { getAdminCategories, getAdminCollections } from "@/lib/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  const [categories, collections] = await Promise.all([
    getAdminCategories(),
    getAdminCollections(),
  ]);

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Add a fabric"
        description="Photograph the cloth, describe how it handles, set the price per unit. Save it as a draft first if you are still checking the stock figure."
      />
      <ProductForm categories={categories} collections={collections} />
    </div>
  );
}
