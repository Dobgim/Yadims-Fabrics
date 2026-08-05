"use client";

import { SafeImage as Image } from "@/components/shared/safe-image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";

import { formatPrice } from "@/lib/utils";
import { luxeEase } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { QuantityStepper } from "@/components/shop/quantity-stepper";
import { lineKey, useStore } from "@/components/providers/store-provider";

export function CartDrawer() {
  const { lines, subtotal, itemCount, isCartOpen, setCartOpen, removeLine, setQuantity } =
    useStore();

  const currency = lines[0]?.currency ?? "XAF";

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-5 text-left">
          <SheetTitle className="flex items-center gap-2 font-display text-xl">
            <ShoppingBag className="h-5 w-5" aria-hidden />
            Your cart
            {itemCount > 0 ? (
              <span className="text-sm font-normal text-muted-foreground">({itemCount})</span>
            ) : null}
          </SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-secondary">
              <ShoppingBag className="h-8 w-8 text-brand-500" aria-hidden />
            </div>
            <div className="space-y-1.5">
              <p className="font-display text-xl">Nothing here yet</p>
              <p className="text-sm text-muted-foreground">
                Every gown starts with a single yard. Have a look at what has just landed.
              </p>
            </div>
            <Button asChild variant="luxe" onClick={() => setCartOpen(false)}>
              <Link href="/shop">Browse fabrics</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
              <AnimatePresence initial={false}>
                {lines.map((line) => {
                  const key = lineKey(line.productId, line.color);
                  return (
                    <motion.li
                      key={key}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: luxeEase }}
                      className="flex gap-4 py-5"
                    >
                      <Link
                        href={`/shop/${line.slug}`}
                        onClick={() => setCartOpen(false)}
                        className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-muted"
                      >
                        {line.image ? (
                          <Image
                            src={line.image}
                            alt={line.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : null}
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium leading-snug">{line.name}</p>
                            {line.color ? (
                              <p className="text-sm text-muted-foreground">{line.color}</p>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLine(key)}
                            aria-label={`Remove ${line.name}`}
                            className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-auto flex items-center justify-between gap-2">
                          <QuantityStepper
                            value={line.quantity}
                            onChange={(q) => setQuantity(key, q)}
                            unit={line.unit}
                            className="h-9 [&_button]:h-9 [&_button]:w-8"
                          />
                          <span className="text-sm font-medium tabular-nums">
                            {formatPrice(line.unitPrice * line.quantity, line.currency)}
                          </span>
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>

            <div className="space-y-4 border-t border-border bg-secondary/40 px-6 py-6">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-display text-2xl tabular-nums">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Delivery calculated at checkout. Free within Yaoundé over{" "}
                {formatPrice(50000, currency)}.
              </p>
              <Separator />
              <div className="grid gap-2">
                <Button asChild variant="luxe" size="lg" onClick={() => setCartOpen(false)}>
                  <Link href="/checkout">
                    Checkout <ArrowRight />
                  </Link>
                </Button>
                <Button asChild variant="ghost" onClick={() => setCartOpen(false)}>
                  <Link href="/cart">View full cart</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
