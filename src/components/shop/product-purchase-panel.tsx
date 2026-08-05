"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, ShoppingBag, Truck, Zap } from "lucide-react";

import { cn, formatPrice, whatsappLink } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ColorPicker } from "@/components/shop/color-picker";
import { QuantityStepper } from "@/components/shop/quantity-stepper";
import { useStore } from "@/components/providers/store-provider";
import type { ProductRow } from "@/types/database";

export function ProductPurchasePanel({ product }: { product: ProductRow }) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted, setCartOpen, hydrated } = useStore();

  const [color, setColor] = React.useState(product.colors[0] ?? null);
  const [quantity, setQuantity] = React.useState(product.min_order_quantity);

  const saved = hydrated && isWishlisted(product.id);
  const inStock = product.stock_quantity > 0;

  const line = {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.images[0] ?? null,
    color,
    unitPrice: product.price,
    currency: product.currency,
    unit: product.unit,
    quantity,
  };

  const buyNow = () => {
    addToCart(line);
    router.push("/checkout");
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-display text-4xl">
          {formatPrice(product.price, product.currency)}
        </span>
        {product.compare_at_price && product.compare_at_price > product.price ? (
          <span className="text-lg text-muted-foreground line-through">
            {formatPrice(product.compare_at_price, product.currency)}
          </span>
        ) : null}
        <span className="text-sm text-muted-foreground">per {product.unit}</span>
      </div>

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

      <Separator />

      {product.colors.length ? (
        <ColorPicker colors={product.colors} value={color} onChange={setColor} />
      ) : null}

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <QuantityStepper
            value={quantity}
            min={product.min_order_quantity}
            max={Math.max(product.stock_quantity, product.min_order_quantity)}
            onChange={setQuantity}
            unit={product.unit}
          />
          <p className="text-sm text-muted-foreground">
            Total{" "}
            <span className="font-medium text-foreground tabular-nums">
              {formatPrice(product.price * quantity, product.currency)}
            </span>
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            variant="luxe"
            size="lg"
            disabled={!inStock}
            onClick={() => {
              addToCart(line);
              setCartOpen(true);
            }}
          >
            <ShoppingBag /> Add to cart
          </Button>
          <Button variant="gold" size="lg" disabled={!inStock} onClick={buyNow}>
            <Zap /> Buy now
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => toggleWishlist(product.id, product.name)}
            aria-pressed={saved}
          >
            <Heart className={cn(saved && "fill-brand-500 text-brand-500")} />
            {saved ? "Saved" : "Save to wishlist"}
          </Button>

          <Button asChild variant="outline" size="lg">
            <a
              href={whatsappLink(
                siteConfig.contact.whatsapp,
                `Hello YADIMS — I would like to ask about ${product.name}${color ? ` in ${color}` : ""}.`,
              )}
              target="_blank"
              rel="noreferrer noopener"
            >
              <MessageCircle /> Ask on WhatsApp
            </a>
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-3xl bg-secondary/60 p-5 text-sm">
        <Truck className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
        <p className="leading-relaxed text-muted-foreground">
          Free delivery within Yaoundé over {formatPrice(50000, product.currency)}. Same-day in
          Yaoundé, next-day in Douala, two to four days elsewhere in Cameroon.{" "}
          <strong className="font-medium text-foreground">
            Order a swatch first if colour is critical.
          </strong>
        </p>
      </div>
    </div>
  );
}
