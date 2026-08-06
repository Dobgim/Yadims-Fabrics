import type { Metadata } from "next";

import {
  getAdminGallery,
  getAdminPosts,
  getAdminProducts,
  getStorageAssets,
} from "@/lib/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MediaLibrary, type MediaAsset } from "@/components/admin/media-library";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Media Library" };

export default async function AdminMediaPage() {
  const [products, gallery, posts, stored] = await Promise.all([
    getAdminProducts(),
    getAdminGallery(),
    getAdminPosts(),
    getStorageAssets(),
  ]);

  // Every URL the site points at, and what points at it. One image can be used
  // in several places, so this is a list rather than a single name.
  const references = new Map<string, string[]>();
  const reference = (url: string | null, by: string) => {
    if (!url) return;
    references.set(url, [...(references.get(url) ?? []), by]);
  };

  for (const product of products) product.images.forEach((url) => reference(url, product.name));
  for (const item of gallery) reference(item.image_url, item.title);
  for (const post of posts) reference(post.cover_image_url, post.title);

  const assets: MediaAsset[] = stored.map((asset) => ({
    ...asset,
    usedBy: references.get(asset.url) ?? [],
    uploaded: true,
  }));

  // Images that are referenced but not in Storage are the ones bundled with the
  // site in `public/`. They are listed so the library is a complete picture,
  // but they cannot be deleted from here — they live in the repository.
  const storedUrls = new Set(stored.map((asset) => asset.url));
  for (const [url, usedBy] of references) {
    if (storedUrls.has(url)) continue;
    assets.push({
      url,
      bucket: "bundled",
      path: url,
      name: url.split("/").pop() ?? url,
      size: 0,
      createdAt: new Date(0).toISOString(),
      usedBy,
      uploaded: false,
    });
  }

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Media library"
        description="Everything in Supabase Storage, plus the imagery bundled with the site. Upload here to have a file ready before you write the fabric it belongs to."
      />
      <MediaLibrary assets={assets} />
    </div>
  );
}
