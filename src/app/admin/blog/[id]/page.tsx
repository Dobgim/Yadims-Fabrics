import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { formatDate } from "@/lib/utils";
import { getAdminPost } from "@/lib/queries/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PostForm } from "@/components/admin/post-form";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getAdminPost(id);
  return { title: post ? `Edit ${post.title}` : "Article" };
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getAdminPost(id);

  if (!post) notFound();

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title={post.title}
        description={
          post.published_at
            ? `Published ${formatDate(post.published_at)}.`
            : "Not published yet — only you can see this."
        }
      />
      <PostForm post={post} />
    </div>
  );
}
