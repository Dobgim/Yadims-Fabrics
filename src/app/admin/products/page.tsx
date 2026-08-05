import type { Metadata } from "next";

import { getAdminProducts } from "@/lib/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductsTable } from "@/components/admin/products-table";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Products"
        description="Every bolt on the shelf. Weight, width and origin are published on the storefront, so keep them accurate — customers buy on those numbers."
      />
      <ProductsTable products={products} />
    </div>
  );
}
