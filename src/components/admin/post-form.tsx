"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { deletePost, savePost } from "@/app/actions/catalogue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DeleteButton,
  Field,
  FormSection,
  SelectField,
  SubmitButton,
  TitleAndSlug,
  fieldErrorFrom,
} from "@/components/admin/form-kit";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { ActionResult } from "@/lib/validations";
import type { BlogPostRow } from "@/types/database";

type SaveState = ActionResult<{ id: string }> | null;

const CATEGORIES = [
  "Fabric Care",
  "Buying Guide",
  "Behind the Cloth",
  "Sewing Notes",
  "Aso-Ebi",
  "Wholesale",
];

/** ~200 words a minute, rounded up. Only a suggestion — the field stays editable. */
function estimateMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function PostForm({ post }: { post?: BlogPostRow }) {
  const router = useRouter();
  const [state, formAction] = useActionState<SaveState, FormData>(savePost, null);
  const [content, setContent] = React.useState(post?.content ?? "");
  const isEdit = Boolean(post);

  React.useEffect(() => {
    if (!state) return;

    if (!state.ok) {
      toast.error(state.message);
      return;
    }

    toast.success(state.message);
    if (!isEdit && state.data?.id) {
      router.replace(`/admin/blog/${state.data.id}`);
    } else {
      router.refresh();
    }
  }, [state, isEdit, router]);

  const err = (field: string) => fieldErrorFrom(state, field);
  const suggested = estimateMinutes(content);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/blog">
            <ArrowLeft /> All articles
          </Link>
        </Button>

        {post ? (
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/blog/${post.slug}`} target="_blank">
                <ExternalLink /> Read on site
              </Link>
            </Button>
            <DeleteButton
              action={deletePost}
              id={post.id}
              entity="article"
              name={post.title}
              onDeleted={() => router.push("/admin/blog")}
            />
          </div>
        ) : null}
      </div>

      <FormSection title="The article">
        <TitleAndSlug
          titleLabel="Title"
          titleName="title"
          slugPrefix="yadimsfabrics.com/blog/"
          defaultTitle={post?.title ?? ""}
          defaultSlug={post?.slug ?? ""}
          titleError={err("title")}
          slugError={err("slug")}
          locked={isEdit}
        />

        <Field
          label="Excerpt"
          htmlFor="excerpt"
          error={err("excerpt")}
          hint="Two lines. Shown on the journal index and in link previews."
        >
          <Textarea
            id="excerpt"
            name="excerpt"
            rows={2}
            maxLength={320}
            defaultValue={post?.excerpt ?? ""}
          />
        </Field>

        <Field
          label="Body"
          htmlFor="content"
          required
          error={err("content")}
          hint="Plain text. Leave a blank line between paragraphs."
        >
          <Textarea
            id="content"
            name="content"
            rows={20}
            required
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="font-normal leading-relaxed"
          />
        </Field>
      </FormSection>

      <FormSection title="Cover image">
        <ImageUploader
          name="cover_image_url"
          bucket="blog"
          defaultValue={post?.cover_image_url ? [post.cover_image_url] : []}
          hint="Landscape, at least 1600px wide."
        />
      </FormSection>

      <FormSection
        title="Publishing"
        description="A draft is invisible on the storefront. Publishing stamps today's date; re-saving a live article leaves that date alone."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Category" htmlFor="category" error={err("category")}>
            <Input
              id="category"
              name="category"
              list="post-categories"
              defaultValue={post?.category ?? "Fabric Care"}
            />
            <datalist id="post-categories">
              {CATEGORIES.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </Field>

          <Field label="Author" htmlFor="author_name" error={err("author_name")}>
            <Input
              id="author_name"
              name="author_name"
              defaultValue={post?.author_name ?? "YADIMS Editorial"}
            />
          </Field>

          <Field
            label="Read time (min)"
            htmlFor="read_minutes"
            error={err("read_minutes")}
            hint={`About ${suggested} at this length.`}
          >
            <Input
              id="read_minutes"
              name="read_minutes"
              type="number"
              min={1}
              max={60}
              step={1}
              defaultValue={post?.read_minutes ?? 4}
              inputMode="numeric"
            />
          </Field>

          <Field label="Status" htmlFor="status" error={err("status")}>
            <SelectField id="status" name="status" defaultValue={post?.status ?? "draft"}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </SelectField>
          </Field>
        </div>

        <Field
          label="Tags"
          htmlFor="tags"
          error={err("tags")}
          hint="Separate with commas."
        >
          <Input
            id="tags"
            name="tags"
            defaultValue={post?.tags.join(", ") ?? ""}
            placeholder="silk, care, storage"
          />
        </Field>
      </FormSection>

      <div className="sticky bottom-4 flex flex-wrap items-center justify-end gap-3 rounded-3xl border border-border bg-card/90 p-4 backdrop-blur">
        <Button asChild type="button" variant="ghost">
          <Link href="/admin/blog">Cancel</Link>
        </Button>
        <SubmitButton label={isEdit ? "Save changes" : "Create article"} />
      </div>
    </form>
  );
}
