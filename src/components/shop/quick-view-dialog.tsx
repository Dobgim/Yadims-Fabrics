"use client";

import * as React from "react";
import { SafeImage as Image } from "@/components/shared/safe-image";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useStore } from "@/components/providers/store-provider";
import { ColorPicker } from "@/components/shop/color-picker";
import { QuantityStepper } from "@/components/shop/quantity-stepper";
import type { ProductRow } from "@/types/database";

interface QuickViewDialogProps {
  product: ProductRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickViewDialog({ product, open, onOpenChange }: QuickViewDialogProps) {
  const { addToCart } = useStore();
  const [color, setColor] = React.useState(product.colors[0] ?? null);
  const [quantity, setQuantity] = React.useState(product.min_order_quantity);

  // Reset the selection each time the dialog is reopened, adjusted during
  // render so the previous product's colour is never briefly shown.
  const openKey = open ? product.id : null;
  const [prevOpenKey, setPrevOpenKey] = React.useState(openKey);
  if (openKey !== prevOpenKey) {
    setPrevOpenKey(openKey);
    if (openKey) {
      setColor(product.colors[0] ?? null);
      setQuantity(product.min_order_quantity);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden rounded-4xl border-border/60 p-0">
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square bg-muted md:aspect-auto md:min-h-[26rem]">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(min-width: 768px) 24rem, 100vw"
                className="object-cover"
              />
            ) : null}
          </div>

          <div className="flex flex-col gap-5 p-6 md:p-8">
            <DialogHeader className="space-y-2 text-left">
              <p className="eyebrow">{product.material}</p>
              <DialogTitle className="font-display text-2xl leading-tight">
                {product.name}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                {product.short_description}
              </DialogDescription>
            </DialogHeader>

            <p className="flex items-baseline gap-2">
              <span className="font-display text-2xl">
                {formatPrice(product.price, product.currency)}
              </span>
              <span className="text-sm text-muted-foreground">per {product.unit}</span>
            </p>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-y border-border/60 py-4 text-sm">
              <dt className="text-muted-foreground">Width</dt>
              <dd>{product.width_cm ? `${product.width_cm} cm` : "-"}</dd>
              <dt className="text-muted-foreground">Weight</dt>
              <dd>{product.weight_gsm ? `${product.weight_gsm} gsm` : "-"}</dd>
              <dt className="text-muted-foreground">In stock</dt>
              <dd>
                {product.stock_quantity > 0
                  ? `${product.stock_quantity} ${product.unit}s`
                  : "Out of stock"}
              </dd>
            </dl>

            {product.colors.length ? (
              <ColorPicker colors={product.colors} value={color} onChange={setColor} />
            ) : null}

            <div className="mt-auto flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <QuantityStepper
                  value={quantity}
                  min={product.min_order_quantity}
                  max={Math.max(product.stock_quantity, product.min_order_quantity)}
                  onChange={setQuantity}
                  unit={product.unit}
                />
                <Button
                  variant="luxe"
                  className="flex-1"
                  disabled={product.stock_quantity === 0}
                  onClick={() => {
                    addToCart({
                      productId: product.id,
                      slug: product.slug,
                      name: product.name,
                      image: product.images[0] ?? null,
                      color,
                      unitPrice: product.price,
                      currency: product.currency,
                      unit: product.unit,
                      quantity,
                    });
                    onOpenChange(false);
                  }}
                >
                  <ShoppingBag /> Add to cart
                </Button>
              </div>

              <Button asChild variant="link" className="self-start">
                <Link href={`/shop/${product.slug}`}>
                  Full details <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
