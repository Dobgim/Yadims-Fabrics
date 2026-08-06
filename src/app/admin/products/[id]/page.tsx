import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAdminCategories, getAdminCollections, getAdminProduct } from "@/lib/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getAdminProduct(id);
  return { title: product ? `Edit ${product.name}` : "Product" };
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categories, collections] = await Promise.all([
    getAdminProduct(id),
    getAdminCategories(),
    getAdminCollections(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title={product.name}
        description={`Last updated ${new Intl.DateTimeFormat("en-GB", {
          dateStyle: "long",
          timeStyle: "short",
        }).format(new Date(product.updated_at))}.`}
      />
      <ProductForm product={product} categories={categories} collections={collections} />
    </div>
  );
}
