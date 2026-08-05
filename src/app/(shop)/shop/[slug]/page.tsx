import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProductReviews } from "@/lib/queries/content";
import {
  getAllProducts,
  getCategories,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/queries/products";
import { siteConfig } from "@/config/site";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeading } from "@/components/shared/section-heading";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductGrid } from "@/components/shop/product-grid";
import { ProductPurchasePanel } from "@/components/shop/product-purchase-panel";
import { ProductReviews, StarRating } from "@/components/shop/product-reviews";
import { ProductJsonLd } from "@/components/seo/json-ld";

export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Fabric not found" };

  const description =
    product.short_description ?? product.description?.slice(0, 160) ?? siteConfig.description;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} — ${siteConfig.shortName}`,
      description,
      images: product.images.slice(0, 1),
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.images.slice(0, 1),
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, reviews, categories] = await Promise.all([
    getRelatedProducts(product, 4),
    getProductReviews(product.id),
    getCategories(),
  ]);

  const category = categories.find((c) => c.id === product.category_id);

  const specs = [
    { label: "Material", value: product.material },
    { label: "Width", value: product.width_cm ? `${product.width_cm} cm` : null },
    { label: "Weight", value: product.weight_gsm ? `${product.weight_gsm} gsm` : null },
    { label: "Origin", value: product.origin },
    { label: "Sold by", value: `The ${product.unit}` },
    { label: "Minimum order", value: `${product.min_order_quantity} ${product.unit}` },
    { label: "Reference", value: product.sku },
    { label: "Colours", value: product.colors.join(", ") || null },
  ].filter((spec) => spec.value);

  return (
    <>
      <PageHeader
        title={product.name}
        eyebrow={category?.name ?? product.material ?? undefined}
        breadcrumbs={[
          { name: "Shop", href: "/shop" },
          ...(category ? [{ name: category.name, href: `/shop?category=${category.slug}` }] : []),
          { name: product.name, href: `/shop/${product.slug}` },
        ]}
      />

      <section className="container py-16 md:py-20">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <ProductGallery images={product.images} alt={product.name} />

          <div>
            {product.rating_count > 0 ? (
              <div className="mb-6 flex items-center gap-3">
                <StarRating value={product.rating_average} />
                <span className="text-sm text-muted-foreground">
                  {product.rating_average.toFixed(1)} · {product.rating_count} reviews
                </span>
              </div>
            ) : null}

            <p className="text-lg leading-relaxed text-muted-foreground">
              {product.short_description}
            </p>

            <Separator className="my-8" />

            <ProductPurchasePanel product={product} />
          </div>
        </div>
      </section>

      <section className="container pb-16 md:pb-24">
        <Tabs defaultValue="description">
          <TabsList className="h-auto w-full justify-start gap-1 rounded-full bg-secondary p-1.5">
            <TabsTrigger value="description" className="rounded-full px-5 py-2.5">
              Description
            </TabsTrigger>
            <TabsTrigger value="specification" className="rounded-full px-5 py-2.5">
              Specification
            </TabsTrigger>
            <TabsTrigger value="care" className="rounded-full px-5 py-2.5">
              Care
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-full px-5 py-2.5">
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="pt-10">
            <p className="max-w-3xl text-[1.0625rem] leading-[1.85] text-muted-foreground">
              {product.description}
            </p>
          </TabsContent>

          <TabsContent value="specification" className="pt-10">
            <dl className="grid max-w-3xl gap-x-10 sm:grid-cols-2">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex justify-between gap-6 border-b border-border py-4"
                >
                  <dt className="text-sm text-muted-foreground">{spec.label}</dt>
                  <dd className="text-right text-sm font-medium">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </TabsContent>

          <TabsContent value="care" className="pt-10">
            <div className="max-w-2xl space-y-4">
              <h2 className="font-display text-2xl">Care instructions</h2>
              <p className="text-[1.0625rem] leading-[1.85] text-muted-foreground">
                {product.care_instructions}
              </p>
              <p className="rounded-3xl bg-secondary/60 p-5 text-sm leading-relaxed text-muted-foreground">
                In coastal humidity, store rolled rather than folded and in cotton rather than
                plastic. Plastic storage is the single most common cause of ruined silk.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="pt-10">
            <ProductReviews product={product} reviews={reviews} />
          </TabsContent>
        </Tabs>
      </section>

      {related.length ? (
        <section className="section bg-secondary/50">
          <div className="container">
            <SectionHeading
              eyebrow="You may also like"
              title="Related fabrics"
              description="Chosen from the same collection and category, in that order."
              className="mb-14"
            />
            <ProductGrid products={related} columns={4} />
          </div>
        </section>
      ) : null}

      <ProductJsonLd product={product} />
    </>
  );
}
