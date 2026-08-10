"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { deleteProduct, saveProduct } from "@/app/actions/catalogue";
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
  ToggleField,
  fieldErrorFrom,
} from "@/components/admin/form-kit";
import { ImageUploader } from "@/components/admin/image-uploader";
import { VideoUploader } from "@/components/admin/video-uploader";
import type { ActionResult } from "@/lib/validations";
import type { CategoryRow, CollectionRow, ProductRow } from "@/types/database";

type SaveState = ActionResult<{ id: string }> | null;

const UNITS = ["yard", "metre", "piece", "bundle", "roll"];

export function ProductForm({
  product,
  categories,
  collections,
}: {
  product?: ProductRow;
  categories: CategoryRow[];
  collections: CollectionRow[];
}) {
  const router = useRouter();
  const [state, formAction] = useActionState<SaveState, FormData>(saveProduct, null);
  const isEdit = Boolean(product);

  React.useEffect(() => {
    if (!state) return;

    if (!state.ok) {
      toast.error(state.message);
      return;
    }

    toast.success(state.message);

    // A newly created fabric has no page of its own yet — move onto its editor
    // so the next save is an update rather than a second insert.
    if (!isEdit && state.data?.id) {
      router.replace(`/admin/products/${state.data.id}`);
    } else {
      router.refresh();
    }
  }, [state, isEdit, router]);

  const err = (field: string) => fieldErrorFrom(state, field);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/products">
            <ArrowLeft /> All products
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {product ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href={`/shop/${product.slug}`} target="_blank">
                  <ExternalLink /> View on site
                </Link>
              </Button>
              <DeleteButton
                action={deleteProduct}
                id={product.id}
                entity="fabric"
                name={product.name}
                onDeleted={() => router.push("/admin/products")}
              />
            </>
          ) : null}
        </div>
      </div>

      <FormSection
        title="The fabric"
        description="The name and description are what a customer reads first. Write it the way you would describe the cloth across the counter."
      >
        <TitleAndSlug
          titleLabel="Fabric name"
          slugPrefix="yadimsfabrics.com/shop/"
          defaultTitle={product?.name ?? ""}
          defaultSlug={product?.slug ?? ""}
          titleError={err("name")}
          slugError={err("slug")}
          locked={isEdit}
        />

        <Field
          label="Short description"
          htmlFor="short_description"
          error={err("short_description")}
          hint="One line, shown on the shop grid and in search results."
        >
          <Input
            id="short_description"
            name="short_description"
            defaultValue={product?.short_description ?? ""}
            maxLength={200}
            placeholder="Heavy-drape Italian silk with a soft satin face"
          />
        </Field>

        <Field
          label="Full description"
          htmlFor="description"
          error={err("description")}
          hint="How it handles, what it suits, how it sews. Blank lines start new paragraphs."
        >
          <Textarea
            id="description"
            name="description"
            rows={8}
            defaultValue={product?.description ?? ""}
            placeholder="A dense, fluid silk woven in Como…"
          />
        </Field>
      </FormSection>

      <FormSection
        title="Photographs"
        description="The first image is the one customers see on the shop grid. Shoot the cloth in daylight against a plain surface — colour accuracy matters more than styling."
      >
        <ImageUploader
          name="images"
          bucket="products"
          multiple
          max={8}
          defaultValue={product?.images ?? []}
          label="Product images"
        />
      </FormSection>

      <FormSection
        title="Videos"
        description="Short clips of the cloth moving — how it drapes, catches light, falls off the bolt. A phone video in daylight is exactly right. Shown after the photographs on the product page."
      >
        <VideoUploader name="videos" max={6} defaultValue={product?.videos ?? []} label="Product videos" />
      </FormSection>

      <FormSection
        title="Stock"
        description="Prices are agreed with each customer on WhatsApp, so there is no price here. Keep the stock figure honest — it is what the storefront calls sold out."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Sold by" htmlFor="unit" error={err("unit")}>
            <SelectField id="unit" name="unit" defaultValue={product?.unit ?? "yard"}>
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  the {unit}
                </option>
              ))}
            </SelectField>
          </Field>

          <Field label="Stock on hand" htmlFor="stock_quantity" error={err("stock_quantity")}>
            <Input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              min={0}
              step={1}
              defaultValue={product?.stock_quantity ?? 0}
              inputMode="numeric"
            />
          </Field>

          <Field
            label="Minimum order"
            htmlFor="min_order_quantity"
            error={err("min_order_quantity")}
            hint="Lace is often sold in fives."
          >
            <Input
              id="min_order_quantity"
              name="min_order_quantity"
              type="number"
              min={1}
              step={1}
              defaultValue={product?.min_order_quantity ?? 1}
              inputMode="numeric"
            />
          </Field>

          <Field label="SKU" htmlFor="sku" error={err("sku")} hint="Your own reference code.">
            <Input id="sku" name="sku" defaultValue={product?.sku ?? ""} placeholder="YF-SLK-014" />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Specification"
        description="Dressmakers buy on weight and width. If you are unsure of a figure, leave it blank rather than guessing — a wrong number comes back as a return."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Material" htmlFor="material" error={err("material")}>
            <Input
              id="material"
              name="material"
              defaultValue={product?.material ?? ""}
              placeholder="100% silk"
            />
          </Field>

          <Field label="Width (cm)" htmlFor="width_cm" error={err("width_cm")}>
            <Input
              id="width_cm"
              name="width_cm"
              type="number"
              min={0}
              step="0.1"
              defaultValue={product?.width_cm ?? ""}
              inputMode="decimal"
            />
          </Field>

          <Field label="Weight (gsm)" htmlFor="weight_gsm" error={err("weight_gsm")}>
            <Input
              id="weight_gsm"
              name="weight_gsm"
              type="number"
              min={0}
              step="0.1"
              defaultValue={product?.weight_gsm ?? ""}
              inputMode="decimal"
            />
          </Field>

          <Field label="Origin" htmlFor="origin" error={err("origin")}>
            <Input
              id="origin"
              name="origin"
              defaultValue={product?.origin ?? ""}
              placeholder="Italy"
            />
          </Field>
        </div>

        <Field label="Care" htmlFor="care_instructions" error={err("care_instructions")}>
          <Textarea
            id="care_instructions"
            name="care_instructions"
            rows={3}
            defaultValue={product?.care_instructions ?? ""}
            placeholder="Dry clean only. Press on low heat through a cloth."
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Colours"
            htmlFor="colors"
            error={err("colors")}
            hint="Separate with commas. These drive the colour filter in the shop."
          >
            <Input
              id="colors"
              name="colors"
              defaultValue={product?.colors.join(", ") ?? ""}
              placeholder="Emerald, Ivory, Champagne"
            />
          </Field>

          <Field
            label="Tags"
            htmlFor="tags"
            error={err("tags")}
            hint="Separate with commas. Used for search and related fabrics."
          >
            <Input
              id="tags"
              name="tags"
              defaultValue={product?.tags.join(", ") ?? ""}
              placeholder="bridal, evening, heavyweight"
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Where it appears"
        description="A draft is invisible to customers. Archive rather than delete anything that has ever been ordered."
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Category" htmlFor="category_id" error={err("category_id")}>
            <SelectField
              id="category_id"
              name="category_id"
              defaultValue={product?.category_id ?? ""}
            >
              <option value="">— none —</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </SelectField>
          </Field>

          <Field label="Collection" htmlFor="collection_id" error={err("collection_id")}>
            <SelectField
              id="collection_id"
              name="collection_id"
              defaultValue={product?.collection_id ?? ""}
            >
              <option value="">— none —</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </SelectField>
          </Field>

          <Field label="Status" htmlFor="status" error={err("status")}>
            <SelectField id="status" name="status" defaultValue={product?.status ?? "draft"}>
              <option value="draft">Draft — hidden</option>
              <option value="active">Active — on sale</option>
              <option value="archived">Archived — withdrawn</option>
            </SelectField>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ToggleField
            name="is_featured"
            label="Feature on the home page"
            description="Appears in the scrolling fabric carousel."
            defaultChecked={product?.is_featured ?? false}
          />
          <ToggleField
            name="is_new_arrival"
            label="Mark as new arrival"
            description="Adds the New badge and lists it under New Arrivals."
            defaultChecked={product?.is_new_arrival ?? false}
          />
        </div>
      </FormSection>

      <div className="sticky bottom-4 flex flex-wrap items-center justify-end gap-3 rounded-3xl border border-border bg-card/90 p-4 backdrop-blur">
        <Button asChild type="button" variant="ghost">
          <Link href="/admin/products">Cancel</Link>
        </Button>
        <SubmitButton label={isEdit ? "Save changes" : "Add fabric"} />
      </div>
    </form>
  );
}
