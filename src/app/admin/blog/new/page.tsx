import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PostForm } from "@/components/admin/post-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New article" };

export default function NewPostPage() {
  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Write an article"
        description="Fabric care, buying guides, notes from the counter. Save it as a draft and publish when you are happy with it."
      />
      <PostForm />
    </div>
  );
}
