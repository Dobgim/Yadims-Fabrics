"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { ExternalLink, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteCategory,
  deleteCollection,
  saveCategory,
  saveCollection,
} from "@/app/actions/catalogue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DeleteButton,
  Field,
  SubmitButton,
  TitleAndSlug,
  ToggleField,
  fieldErrorFrom,
} from "@/components/admin/form-kit";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { ActionResult } from "@/lib/validations";
import type { CategoryRow, CollectionRow } from "@/types/database";

type SaveState = ActionResult<{ id: string }> | null;
type Kind = "category" | "collection";

/**
 * Categories and collections are near-identical to edit — a name, a slug, some
 * copy and a cover image — so they share one manager rather than two that drift
 * apart. The differences are declared here, once.
 */
const CONFIG = {
  category: {
    noun: "category",
    plural: "Categories",
    save: saveCategory,
    remove: deleteCategory,
    hrefFor: (slug: string) => `/shop?category=${slug}`,
    slugPrefix: "yadimsfabrics.com/shop?category=",
    blurb: "Grouped by fibre and construction — silk, lace, jacquard. This is what the shop filters use.",
  },
  collection: {
    noun: "collection",
    plural: "Collections",
    save: saveCollection,
    remove: deleteCollection,
    hrefFor: (slug: string) => `/collections/${slug}`,
    slugPrefix: "yadimsfabrics.com/collections/",
    blurb: "Grouped by occasion — bridal, aso-ebi, evening. This is what customers actually shop by.",
  },
} as const;

export interface TaxonomyRecord {
  row: CategoryRow | CollectionRow;
  count: number;
}

export function TaxonomyManager({ kind, records }: { kind: Kind; records: TaxonomyRecord[] }) {
  const config = CONFIG[kind];
  const [editing, setEditing] = React.useState<CategoryRow | CollectionRow | null>(null);
  const [creating, setCreating] = React.useState(false);

  const open = creating || editing !== null;
  const close = () => {
    setCreating(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-muted-foreground">{config.blurb}</p>
        <Button variant="luxe" size="sm" onClick={() => setCreating(true)}>
          <Plus /> New {config.noun}
        </Button>
      </div>

      {records.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border py-20 text-center">
          <p className="text-sm text-muted-foreground">
            No {config.plural.toLowerCase()} yet. Create the first one to start grouping fabric.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {records.map(({ row, count }) => {
            const image =
              "image_url" in row ? row.image_url : (row as CollectionRow).cover_image_url;
            const blurb =
              "description" in row && row.description
                ? row.description
                : ((row as CollectionRow).tagline ?? null);

            return (
              <li
                key={row.id}
                className="group overflow-hidden rounded-3xl border border-border bg-card"
              >
                <div className="relative aspect-[16/9] bg-muted">
                  {image ? (
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                      className="object-cover"
                    />
                  ) : null}

                  {row.is_featured ? (
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-brand-900">
                      <Star className="h-3 w-3 fill-current" aria-hidden /> Featured
                    </span>
                  ) : null}
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-xl">{row.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">/{row.slug}</p>
                    </div>
                    <Link
                      href={config.hrefFor(row.slug)}
                      target="_blank"
                      aria-label={`View ${row.name} on the site`}
                      className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>

                  {blurb ? (
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {blurb}
                    </p>
                  ) : null}

                  <div className="mt-5 flex items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium tabular-nums text-foreground">{count}</span>{" "}
                      {count === 1 ? "fabric" : "fabrics"}
                    </p>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${row.name}`}
                        onClick={() => setEditing(row)}
                      >
                        <Pencil />
                      </Button>
                      <DeleteButton
                        action={config.remove}
                        id={row.id}
                        entity={config.noun}
                        name={row.name}
                        size="icon-sm"
                      >
                        <Trash2 />
                      </DeleteButton>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={open} onOpenChange={(next) => (next ? null : close())}>
        <DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${editing.name}` : `New ${config.noun}`}
            </DialogTitle>
            <DialogDescription>{config.blurb}</DialogDescription>
          </DialogHeader>

          {open ? (
            // Keyed so switching rows rebuilds the form with fresh defaults
            // instead of showing the previous row's values.
            <TaxonomyForm
              key={editing?.id ?? "new"}
              kind={kind}
              row={editing}
              onSaved={close}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TaxonomyForm({
  kind,
  row,
  onSaved,
}: {
  kind: Kind;
  row: CategoryRow | CollectionRow | null;
  onSaved: () => void;
}) {
  const config = CONFIG[kind];
  const router = useRouter();
  const [state, formAction] = useActionState<SaveState, FormData>(config.save, null);

  React.useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      router.refresh();
      onSaved();
    } else {
      toast.error(state.message);
    }
  }, [state, router, onSaved]);

  const err = (field: string) => fieldErrorFrom(state, field);
  const collection = kind === "collection" ? (row as CollectionRow | null) : null;
  const category = kind === "category" ? (row as CategoryRow | null) : null;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {row ? <input type="hidden" name="id" value={row.id} /> : null}

      <TitleAndSlug
        titleLabel={`${config.noun[0].toUpperCase()}${config.noun.slice(1)} name`}
        slugPrefix={config.slugPrefix}
        defaultTitle={row?.name ?? ""}
        defaultSlug={row?.slug ?? ""}
        titleError={err("name")}
        slugError={err("slug")}
        locked={Boolean(row)}
      />

      {kind === "collection" ? (
        <Field
          label="Tagline"
          htmlFor="tagline"
          error={err("tagline")}
          hint="One line under the collection title."
        >
          <Input
            id="tagline"
            name="tagline"
            defaultValue={collection?.tagline ?? ""}
            maxLength={160}
            placeholder="Cloth for the day everything is photographed"
          />
        </Field>
      ) : null}

      <Field label="Description" htmlFor="description" error={err("description")}>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={row?.description ?? ""}
          placeholder="What belongs in here, and who it is for."
        />
      </Field>

      {kind === "category" ? (
        <ImageUploader
          name="image_url"
          bucket="products"
          label="Category image"
          defaultValue={category?.image_url ? [category.image_url] : []}
          hint="Landscape works best — this sits behind the category name."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <ImageUploader
            name="cover_image_url"
            bucket="products"
            label="Cover image"
            defaultValue={collection?.cover_image_url ? [collection.cover_image_url] : []}
          />
          <ImageUploader
            name="accent_image_url"
            bucket="products"
            label="Accent image"
            defaultValue={collection?.accent_image_url ? [collection.accent_image_url] : []}
            hint="The smaller, offset photograph."
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Position"
          htmlFor="position"
          error={err("position")}
          hint="Lower numbers appear first."
        >
          <Input
            id="position"
            name="position"
            type="number"
            min={0}
            step={1}
            defaultValue={row?.position ?? 0}
            inputMode="numeric"
          />
        </Field>

        <ToggleField
          name="is_featured"
          label="Feature on the home page"
          defaultChecked={row?.is_featured ?? false}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onSaved}>
          Cancel
        </Button>
        <SubmitButton label={row ? "Save changes" : `Create ${config.noun}`} />
      </div>
    </form>
  );
}
