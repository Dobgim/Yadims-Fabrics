import type { Metadata } from "next";

import { getAdminGallery, getAdminPosts, getAdminProducts } from "@/lib/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MediaLibrary } from "@/components/admin/media-library";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Media Library" };

export default async function AdminMediaPage() {
  const [products, gallery, posts] = await Promise.all([
    getAdminProducts(),
    getAdminGallery(),
    getAdminPosts(),
  ]);

  // Every image referenced anywhere, de-duplicated by URL and tagged by bucket.
  const assets = new Map<string, { url: string; bucket: string; usedBy: string }>();

  for (const product of products) {
    product.images.forEach((url) =>
      assets.set(url, { url, bucket: "products", usedBy: product.name }),
    );
  }
  for (const item of gallery) {
    assets.set(item.image_url, { url: item.image_url, bucket: "gallery", usedBy: item.title });
  }
  for (const post of posts) {
    if (post.cover_image_url) {
      assets.set(post.cover_image_url, {
        url: post.cover_image_url,
        bucket: "blog",
        usedBy: post.title,
      });
    }
  }

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Media library"
        description="Every image referenced by a product, gallery item or article. Uploads go to Supabase Storage under the matching bucket."
      />
      <MediaLibrary assets={[...assets.values()]} />
    </div>
  );
}
