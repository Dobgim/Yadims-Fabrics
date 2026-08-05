import type { Metadata } from "next";
import { Suspense } from "react";

import {
  getCategories,
  getCollections,
  getFacets,
  searchProducts,
  type SortKey,
} from "@/lib/queries/products";
import { PageHeader } from "@/components/shared/page-header";
import { FilterDrawer, FilterSidebar } from "@/components/shop/filter-sidebar";
import { ShopResults } from "@/components/shop/shop-results";
import { ProductGridSkeleton } from "@/components/shop/product-grid-skeleton";
import { ContactBanner } from "@/components/shared/contact-banner";

export const metadata: Metadata = {
  title: "Shop Fabrics",
  description:
    "Browse the full YADIMS shelf — luxury lace, mulberry silk, bridal mikado, wax print, velvet and linen. Weight, width and origin published on every bolt.",
  alternates: { canonical: "/shop" },
};

const PER_PAGE = 9;

type SearchParams = Record<string, string | string[] | undefined>;

/** Search params arrive as `string | string[]`; normalise to an array. */
function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function toNumber(value: string | string[] | undefined): number | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  if (!first) return undefined;
  const parsed = Number(first);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [categories, collections, facets] = await Promise.all([
    getCategories(),
    getCollections(),
    getFacets(),
  ]);

  // The URL carries human-readable slugs; the query layer works in ids.
  const categorySlugs = toArray(params.category);
  const categoryIds = categories.filter((c) => categorySlugs.includes(c.slug)).map((c) => c.id);

  const collectionSlug = toArray(params.collection)[0];
  const collectionId = collections.find((c) => c.slug === collectionSlug)?.id;

  const result = await searchProducts({
    search: toArray(params.q)[0],
    categories: categoryIds,
    collection: collectionId,
    materials: toArray(params.material),
    colors: toArray(params.color),
    minPrice: toNumber(params.minPrice),
    maxPrice: toNumber(params.maxPrice),
    onlyNew: toArray(params.new)[0] === "1",
    sort: (toArray(params.sort)[0] as SortKey) || "newest",
    page: toNumber(params.page) ?? 1,
    perPage: PER_PAGE,
  });

  const filterOptions = {
    categories,
    collections,
    materials: facets.materials,
    colors: facets.colors,
    priceRange: facets.priceRange,
  };

  return (
    <>
      <PageHeader
        eyebrow="The full shelf"
        title="Shop fabrics"
        description="The whole shelf, filtered however you need it. Every listing publishes weight, width, fibre content and origin — the four things a photograph cannot tell you."
        breadcrumbs={[{ name: "Shop", href: "/shop" }]}
      />

      <div className="container flex gap-12 py-16 md:py-20">
        <Suspense fallback={<div className="hidden w-64 shrink-0 lg:block" />}>
          <FilterSidebar options={filterOptions} />
        </Suspense>

        <Suspense fallback={<ProductGridSkeleton count={PER_PAGE} />}>
          <ShopResults
            products={result.items}
            total={result.total}
            page={result.page}
            pageCount={result.pageCount}
            filterTrigger={<FilterDrawer options={filterOptions} />}
          />
        </Suspense>
      </div>

      <ContactBanner />
    </>
  );
}
