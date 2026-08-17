import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { legalSlugs } from "@/data/legal";
import { getAllProducts, getCollections } from "@/lib/queries/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = (
    [
      { url: base, changeFrequency: "weekly", priority: 1 },
      { url: `${base}/shop`, changeFrequency: "daily", priority: 0.9 },
      { url: `${base}/preorder`, changeFrequency: "daily", priority: 0.8 },
      { url: `${base}/collections`, changeFrequency: "weekly", priority: 0.8 },
      { url: `${base}/gallery`, changeFrequency: "weekly", priority: 0.6 },
      { url: `${base}/services`, changeFrequency: "monthly", priority: 0.7 },
      { url: `${base}/about`, changeFrequency: "monthly", priority: 0.7 },
      { url: `${base}/faqs`, changeFrequency: "monthly", priority: 0.6 },
      { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.7 },
    ] satisfies MetadataRoute.Sitemap
  ).map((entry) => ({ ...entry, lastModified: now }));

  const [products, collections] = await Promise.all([getAllProducts(), getCollections()]);

  return [
    ...staticRoutes,
    ...collections.map((collection) => ({
      url: `${base}/collections/${collection.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${base}/shop/${product.slug}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...legalSlugs.map((slug) => ({
      url: `${base}/${slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
