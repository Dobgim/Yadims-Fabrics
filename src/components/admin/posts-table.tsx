"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { cn, formatDate } from "@/lib/utils";
import { togglePostStatus } from "@/app/actions/admin";
import { deletePost } from "@/app/actions/catalogue";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/form-kit";
import type { BlogPostRow } from "@/types/database";

export function PostsTable({ posts }: { posts: BlogPostRow[] }) {
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const toggle = async (id: string, published: boolean) => {
    setPendingId(id);
    const result = await togglePostStatus(id, published ? "published" : "draft");
    setPendingId(null);
    if (result.ok) toast.success(result.message);
    else toast.error(result.message);
  };

  const columns: Column<BlogPostRow>[] = [
    {
      key: "title",
      header: "Article",
      value: (p) => p.title,
      cell: (p) => (
        <Link href={`/admin/blog/${p.id}`} className="group flex items-center gap-3">
          <span className="relative h-11 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
            {p.cover_image_url ? (
              <Image src={p.cover_image_url} alt="" fill sizes="64px" className="object-cover" />
            ) : null}
          </span>
          <span className="min-w-0">
            <span className="block max-w-[20rem] truncate font-medium group-hover:text-brand-600">
              {p.title}
            </span>
            <span className="block text-xs text-muted-foreground">
              {p.read_minutes} min · {p.author_name}
            </span>
          </span>
        </Link>
      ),
    },
    {
      key: "category",
      header: "Category",
      value: (p) => p.category,
      cell: (p) => (
        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
          {p.category}
        </span>
      ),
    },
    {
      key: "published",
      header: "Published",
      value: (p) => p.published_at ?? "",
      cell: (p) => (
        <span className="text-sm text-muted-foreground">
          {p.published_at ? formatDate(p.published_at) : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Live",
      value: (p) => (p.status === "published" ? 1 : 0),
      cell: (p) => (
        <Switch
          checked={p.status === "published"}
          disabled={pendingId === p.id}
          onCheckedChange={(value) => toggle(p.id, value)}
          aria-label={`Publish status for ${p.title}`}
          className={cn(p.status !== "published" && "opacity-60")}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button asChild variant="ghost" size="icon-sm" aria-label={`Edit ${p.title}`}>
            <Link href={`/admin/blog/${p.id}`}>
              <Pencil />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon-sm" aria-label={`Read ${p.title}`}>
            <Link href={`/blog/${p.slug}`} target="_blank">
              <ExternalLink />
            </Link>
          </Button>
          <DeleteButton
            action={deletePost}
            id={p.id}
            entity="article"
            name={p.title}
            size="icon-sm"
          >
            <Trash2 />
          </DeleteButton>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      rows={posts}
      columns={columns}
      rowKey={(p) => p.id}
      searchPlaceholder="Search articles"
      emptyMessage="No articles yet."
      toolbar={
        <Button asChild variant="luxe" size="sm">
          <Link href="/admin/blog/new">
            <Plus /> New article
          </Link>
        </Button>
      }
    />
  );
}
