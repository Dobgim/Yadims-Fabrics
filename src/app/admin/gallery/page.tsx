import type { Metadata } from "next";

import { getAdminGallery } from "@/lib/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { GalleryManager } from "@/components/admin/gallery-manager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gallery" };

export default async function AdminGalleryPage() {
  const items = await getAdminGallery();

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Gallery"
        description="Store photos, fabric displays, new stock and customer showcases. Hidden items stay out of the public gallery."
      />
      <GalleryManager items={items} />
    </div>
  );
}
