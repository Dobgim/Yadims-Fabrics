"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { ImageOff, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { deleteGalleryItem, saveGalleryItem } from "@/app/actions/catalogue";
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
  SelectField,
  SubmitButton,
  ToggleField,
  fieldErrorFrom,
} from "@/components/admin/form-kit";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { ActionResult } from "@/lib/validations";
import type { GalleryItemRow } from "@/types/database";

type SaveState = ActionResult<{ id: string }> | null;

/** Suggested groupings. The field stays free text so new ones can be invented. */
const CATEGORIES = ["Store", "Fabric", "Customers", "Behind the scenes", "New stock", "Events"];

export function GalleryManager({ items }: { items: GalleryItemRow[] }) {
  const categories = React.useMemo(
    () => ["All", ...Array.from(new Set(items.map((item) => item.category)))],
    [items],
  );
  const [filter, setFilter] = React.useState("All");
  const [editing, setEditing] = React.useState<GalleryItemRow | null>(null);
  const [creating, setCreating] = React.useState(false);

  const visible = filter === "All" ? items : items.filter((item) => item.category === filter);
  const open = creating || editing !== null;
  const close = () => {
    setCreating(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter gallery">
          {categories.map((category) => (
            <Button
              key={category}
              role="tab"
              aria-selected={filter === category}
              variant={filter === category ? "luxe" : "outline"}
              size="sm"
              onClick={() => setFilter(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <Button variant="luxe" size="sm" onClick={() => setCreating(true)}>
          <Plus /> Upload image
        </Button>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border py-20 text-center">
          <ImageOff className="h-8 w-8 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">Nothing in the gallery yet.</p>
          <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
            <Plus /> Upload the first photograph
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((item) => (
            <li
              key={item.id}
              className="group overflow-hidden rounded-3xl border border-border bg-card"
            >
              <div className="relative aspect-[4/3] bg-muted">
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw"
                  className="object-cover"
                />
                <span
                  className={cn(
                    "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.12em]",
                    item.is_published
                      ? "bg-brand-500 text-white"
                      : "bg-white/90 text-muted-foreground backdrop-blur",
                  )}
                >
                  {item.is_published ? "Live" : "Hidden"}
                </span>
              </div>

              <div className="p-5">
                <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {item.category}
                </p>
                <h3 className="mt-2 truncate font-medium">{item.title}</h3>
                {item.caption ? (
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {item.caption}
                  </p>
                ) : null}

                <div className="mt-4 flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${item.title}`}
                    onClick={() => setEditing(item)}
                  >
                    <Pencil />
                  </Button>
                  <DeleteButton
                    action={deleteGalleryItem}
                    id={item.id}
                    entity="photograph"
                    name={item.title}
                    size="icon-sm"
                  >
                    <Trash2 />
                  </DeleteButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={(next) => (next ? null : close())}>
        <DialogContent className="max-h-[88dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.title}` : "Add a photograph"}</DialogTitle>
            <DialogDescription>
              Hidden photographs stay out of the public gallery until you publish them.
            </DialogDescription>
          </DialogHeader>

          {open ? (
            <GalleryForm key={editing?.id ?? "new"} item={editing} onSaved={close} />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GalleryForm({
  item,
  onSaved,
}: {
  item: GalleryItemRow | null;
  onSaved: () => void;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<SaveState, FormData>(saveGalleryItem, null);

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

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {item ? <input type="hidden" name="id" value={item.id} /> : null}

      <ImageUploader
        name="image_url"
        bucket="gallery"
        label="Photograph"
        defaultValue={item?.image_url ? [item.image_url] : []}
      />
      {err("image_url") ? (
        <p role="alert" className="text-xs text-destructive">
          {err("image_url")}
        </p>
      ) : null}

      <Field label="Title" htmlFor="title" required error={err("title")}>
        <Input
          id="title"
          name="title"
          required
          defaultValue={item?.title ?? ""}
          placeholder="The lace shelves"
        />
      </Field>

      <Field
        label="Caption"
        htmlFor="caption"
        error={err("caption")}
        hint="Optional. Shown when the photograph is opened."
      >
        <Textarea
          id="caption"
          name="caption"
          rows={3}
          defaultValue={item?.caption ?? ""}
          placeholder="Stone and beaded lace, sorted by weight."
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Group" htmlFor="category" error={err("category")}>
          <Input
            id="category"
            name="category"
            list="gallery-categories"
            defaultValue={item?.category ?? "Store"}
          />
          <datalist id="gallery-categories">
            {CATEGORIES.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </Field>

        <Field
          label="Shape"
          htmlFor="aspect"
          error={err("aspect")}
          hint="Sets its tile in the mosaic."
        >
          <SelectField id="aspect" name="aspect" defaultValue={item?.aspect ?? "portrait"}>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
            <option value="square">Square</option>
          </SelectField>
        </Field>

        <Field label="Position" htmlFor="position" error={err("position")}>
          <Input
            id="position"
            name="position"
            type="number"
            min={0}
            step={1}
            defaultValue={item?.position ?? 0}
            inputMode="numeric"
          />
        </Field>
      </div>

      <ToggleField
        name="is_published"
        label="Show in the public gallery"
        defaultChecked={item?.is_published ?? true}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onSaved}>
          Cancel
        </Button>
        <SubmitButton label={item ? "Save changes" : "Add photograph"} />
      </div>
    </form>
  );
}
