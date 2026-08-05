"use client";

import { SafeImage as Image } from "@/components/shared/safe-image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";

import { formatPrice } from "@/lib/utils";
import { luxeEase } from "@/lib/motion";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/pricing";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { QuantityStepper } from "@/components/shop/quantity-stepper";
import { lineKey, useStore } from "@/components/providers/store-provider";

export function CartView() {
  const { lines, subtotal, itemCount, removeLine, setQuantity, clearCart, hydrated } = useStore();

  // The cart lives in localStorage, so the server render has nothing to show.
  if (!hydrated) {
    return (
      <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-4xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-4xl" />
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-4xl border border-dashed border-border py-24 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-secondary">
          <ShoppingBag className="h-8 w-8 text-brand-500" aria-hidden />
        </div>
        <div className="space-y-2">
          <p className="font-display text-2xl">Your cart is empty</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Every gown starts with a single yard. Have a look at what has just landed on the shelf.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="luxe">
            <Link href="/shop">Browse fabrics</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/collections">See collections</Link>
          </Button>
        </div>
      </div>
    );
  }

  const currency = lines[0].currency;
  const remaining = FREE_DELIVERY_THRESHOLD - subtotal;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
      <div>
        <div className="flex items-center justify-between pb-5">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground tabular-nums">{itemCount}</span>{" "}
            {itemCount === 1 ? "item" : "items"}
          </p>
          <button
            type="button"
            onClick={clearCart}
            className="text-sm text-muted-foreground transition-colors hover:text-destructive"
          >
            Empty cart
          </button>
        </div>

        <ul className="space-y-4">
          <AnimatePresence initial={false}>
            {lines.map((line) => {
              const key = lineKey(line.productId, line.color);
              return (
                <motion.li
                  key={key}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.35, ease: luxeEase }}
                  className="grid gap-5 rounded-4xl border border-border/70 bg-card p-5 sm:grid-cols-[7rem_1fr]"
                >
                  <Link
                    href={`/shop/${line.slug}`}
                    className="relative aspect-square overflow-hidden rounded-3xl bg-muted sm:aspect-auto sm:h-32"
                  >
                    {line.image ? (
                      <Image
                        src={line.image}
                        alt={line.name}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    ) : null}
                  </Link>

                  <div className="flex flex-col justify-between gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="font-display text-lg leading-snug">
                          <Link href={`/shop/${line.slug}`} className="link-underline">
                            {line.name}
                          </Link>
                        </h2>
                        {line.color ? (
                          <p className="mt-1 text-sm text-muted-foreground">{line.color}</p>
                        ) : null}
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatPrice(line.unitPrice, line.currency)} per {line.unit}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeLine(key)}
                        aria-label={`Remove ${line.name}`}
                        className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <QuantityStepper
                        value={line.quantity}
                        onChange={(q) => setQuantity(key, q)}
                        unit={line.unit}
                      />
                      <span className="font-display text-xl tabular-nums">
                        {formatPrice(line.unitPrice * line.quantity, line.currency)}
                      </span>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        <Button asChild variant="link" className="mt-8">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-4xl border border-border/70 bg-card p-8">
          <h2 className="font-display text-xl">Order summary</h2>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="text-muted-foreground">Calculated at checkout</dd>
            </div>
          </dl>

          <Separator className="my-6" />

          <div className="flex items-baseline justify-between">
            <span className="font-medium">Total</span>
            <span className="font-display text-3xl tabular-nums">
              {formatPrice(subtotal, currency)}
            </span>
          </div>

          {remaining > 0 ? (
            <div className="mt-6 space-y-2 rounded-3xl bg-secondary/70 p-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Add{" "}
                <strong className="font-medium text-foreground">
                  {formatPrice(remaining, currency)}
                </strong>{" "}
                for free delivery within Yaoundé.
              </p>
              <div
                className="h-1.5 overflow-hidden rounded-full bg-border"
                role="progressbar"
                aria-valuenow={Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progress toward free delivery"
              >
                <span
                  className="block h-full rounded-full bg-brand-500 transition-[width] duration-700 ease-luxe"
                  style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="mt-6 rounded-3xl bg-brand-50 p-4 text-xs text-brand-700 dark:bg-brand-800/50 dark:text-brand-200">
              Free delivery within Yaoundé applies to this order.
            </p>
          )}

          <Button asChild variant="luxe" size="lg" className="mt-7 w-full">
            <Link href="/checkout">
              Proceed to checkout <ArrowRight />
            </Link>
          </Button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Cut lengths cannot be returned unless faulty.
          </p>
        </div>
      </aside>
    </div>
  );
}
