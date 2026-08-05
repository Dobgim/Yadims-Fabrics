import type { Metadata } from "next";

import { getAdminPosts } from "@/lib/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PostsTable } from "@/components/admin/posts-table";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Journal" };

export default async function AdminBlogPage() {
  const posts = await getAdminPosts();
  const published = posts.filter((p) => p.status === "published").length;

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Journal"
        description={`${published} published of ${posts.length}. Toggling an article live publishes it immediately and stamps the publication date.`}
      />
      <PostsTable posts={posts} />
    </div>
  );
}
