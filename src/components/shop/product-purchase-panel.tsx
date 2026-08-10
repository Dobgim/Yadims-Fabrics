"use client";

import * as React from "react";
import { Heart, MessageCircle, Ruler, Truck } from "lucide-react";

import { cn, fabricEnquiryLink } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ColorPicker } from "@/components/shop/color-picker";
import { QuantityStepper } from "@/components/shop/quantity-stepper";
import { useStore } from "@/components/providers/store-provider";
import type { ProductRow } from "@/types/database";

/**
 * The panel beside a fabric. The shop sells by enquiry — the customer picks a
 * colour and a rough quantity, then taps through to WhatsApp where the price is
 * agreed. There is no price, no cart and no checkout here by design.
 */
export function ProductPurchasePanel({ product }: { product: ProductRow }) {
  const { toggleWishlist, isWishlisted, hydrated } = useStore();

  const [color, setColor] = React.useState(product.colors[0] ?? null);
  const [quantity, setQuantity] = React.useState(product.min_order_quantity);

  const saved = hydrated && isWishlisted(product.id);
  const inStock = product.stock_quantity > 0;

  const enquiry = fabricEnquiryLink({
    number: siteConfig.contact.whatsapp,
    siteUrl: siteConfig.url,
    name: product.name,
    slug: product.slug,
    color,
    quantity,
    unit: product.unit,
  });

  return (
    <div className="space-y-7">
      <p
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium",
          inStock
            ? "bg-brand-50 text-brand-700 dark:bg-brand-800/50 dark:text-brand-200"
            : "bg-secondary text-muted-foreground",
        )}
      >
        <span
          className={cn("h-1.5 w-1.5 rounded-full", inStock ? "bg-brand-500" : "bg-muted-foreground")}
          aria-hidden
        />
        {inStock
          ? `${product.stock_quantity} ${product.unit}s on the bolt`
          : "Currently off the shelf — ask us to reorder"}
      </p>

      <div className="flex items-start gap-3 rounded-2xl bg-secondary/60 p-4 text-sm">
        <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
        <p className="leading-relaxed text-muted-foreground">
          Price is agreed on WhatsApp — tell us how much you need and we will quote you, often below
          what you would pay to import it yourself.
        </p>
      </div>

      <Separator />

      {product.colors.length ? (
        <ColorPicker colors={product.colors} value={color} onChange={setColor} />
      ) : null}

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <QuantityStepper
            value={quantity}
            min={product.min_order_quantity}
            max={Math.max(product.stock_quantity, product.min_order_quantity)}
            onChange={setQuantity}
            unit={product.unit}
          />
          <p className="text-sm text-muted-foreground">
            How much you are after, roughly — you can change your mind in the chat.
          </p>
        </div>

        <Button asChild variant="luxe" size="xl" className="w-full">
          <a href={enquiry} target="_blank" rel="noreferrer noopener">
            <MessageCircle /> Enquire on WhatsApp
          </a>
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => toggleWishlist(product.id, product.name)}
          aria-pressed={saved}
        >
          <Heart className={cn(saved && "fill-brand-500 text-brand-500")} />
          {saved ? "Saved" : "Save to my fabrics"}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-3xl bg-secondary/60 p-5 text-sm">
          <Ruler className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
          <p className="leading-relaxed text-muted-foreground">
            Ask for a swatch first if the exact colour matters — a screen never gets white quite
            right.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-3xl bg-secondary/60 p-5 text-sm">
          <Truck className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
          <p className="leading-relaxed text-muted-foreground">
            Same-day in Yaoundé, next-day in Douala, two to four days elsewhere in Cameroon.
          </p>
        </div>
      </div>
    </div>
  );
}
