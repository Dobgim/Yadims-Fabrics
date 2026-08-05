"use client";

import * as React from "react";
import { SafeImage as Image } from "@/components/shared/safe-image";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Lock, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { cn, formatPrice } from "@/lib/utils";
import { calculateShipping, calculateTotals, paymentMethods } from "@/lib/pricing";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import { placeOrder, type PlacedOrder } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { lineKey, useStore } from "@/components/providers/store-provider";

interface CheckoutFormProps {
  defaults?: Partial<CheckoutInput>;
}

export function CheckoutForm({ defaults }: CheckoutFormProps) {
  const { lines, subtotal, clearCart, hydrated } = useStore();
  const [placed, setPlaced] = React.useState<PlacedOrder | null>(null);

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      label: "Home",
      fullName: "",
      phone: "",
      email: "",
      line1: "",
      line2: "",
      city: "Yaoundé",
      region: "",
      country: "Cameroon",
      postalCode: "",
      paymentMethod: "cash_on_delivery",
      deliveryMethod: "delivery",
      notes: "",
      ...defaults,
    },
  });

  /*
   * `useWatch` rather than `form.watch()`: watch() returns a fresh function
   * each render and cannot be memoized, so the React Compiler skips compiling
   * the whole component. useWatch subscribes per field and is compiler-safe.
   */
  const control = form.control;
  const city = useWatch({ control, name: "city" });
  const deliveryMethod = useWatch({ control, name: "deliveryMethod" });
  const paymentMethod = useWatch({ control, name: "paymentMethod" });
  const currency = lines[0]?.currency ?? "XAF";

  const shipping = calculateShipping(subtotal, city ?? "", deliveryMethod);
  const totals = calculateTotals(subtotal, shipping);

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await placeOrder(
      values,
      lines.map((line) => ({
        productId: line.productId,
        color: line.color,
        quantity: line.quantity,
      })),
    );

    if (!result.ok) {
      toast.error(result.message);
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          form.setError(field as keyof CheckoutInput, { message: messages[0] });
        });
      }
      return;
    }

    setPlaced(result.data ?? null);
    clearCart();
    toast.success("Order placed", { description: "We will confirm by WhatsApp shortly." });
  });

  if (!hydrated) {
    return (
      <div className="grid gap-12 lg:grid-cols-[1fr_22rem]">
        <Skeleton className="h-[36rem] w-full rounded-4xl" />
        <Skeleton className="h-96 w-full rounded-4xl" />
      </div>
    );
  }

  if (placed) {
    return <OrderConfirmation order={placed} />;
  }

  if (!lines.length) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-4xl border border-dashed border-border py-24 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-secondary">
          <ShoppingBag className="h-8 w-8 text-brand-500" aria-hidden />
        </div>
        <div className="space-y-2">
          <p className="font-display text-2xl">There is nothing to check out</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Add a fabric to your cart and this page will fill itself in.
          </p>
        </div>
        <Button asChild variant="luxe">
          <Link href="/shop">Browse fabrics</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16" noValidate>
      <div className="space-y-12">
        {/* ---------------------------------------------------- Contact */}
        <fieldset className="space-y-5">
          <Legend step="01" title="Contact" />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Full name" error={form.formState.errors.fullName?.message} required>
              <Input {...form.register("fullName")} autoComplete="name" placeholder="Ada Kounde" />
            </FormField>

            <FormField label="Phone" error={form.formState.errors.phone?.message} required>
              <Input
                {...form.register("phone")}
                type="tel"
                autoComplete="tel"
                placeholder="+237 6xx xxx xxx"
              />
            </FormField>
          </div>

          <FormField label="Email" error={form.formState.errors.email?.message} required>
            <Input
              {...form.register("email")}
              type="email"
              autoComplete="email"
              placeholder="you@email.com"
            />
          </FormField>
        </fieldset>

        {/* --------------------------------------------------- Delivery */}
        <fieldset className="space-y-5">
          <Legend step="02" title="Delivery" />

          <RadioGroup
            value={deliveryMethod}
            onValueChange={(value) =>
              form.setValue("deliveryMethod", value as CheckoutInput["deliveryMethod"])
            }
            className="grid gap-3 sm:grid-cols-2"
          >
            <OptionCard
              id="delivery"
              value="delivery"
              title="Deliver to me"
              hint="Same-day in Yaoundé, next-day in Douala, 2–4 days nationwide."
              selected={deliveryMethod === "delivery"}
            />
            <OptionCard
              id="collection"
              value="collection"
              title="Collect in store"
              hint="Free. We message you when your cut is ready."
              selected={deliveryMethod === "collection"}
            />
          </RadioGroup>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Address" error={form.formState.errors.line1?.message} required>
              <Input
                {...form.register("line1")}
                autoComplete="address-line1"
                placeholder="Street and number"
              />
            </FormField>

            <FormField label="Apartment, landmark (optional)">
              <Input {...form.register("line2")} autoComplete="address-line2" />
            </FormField>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <FormField label="City" error={form.formState.errors.city?.message} required>
              <Input {...form.register("city")} autoComplete="address-level2" />
            </FormField>

            <FormField label="Region (optional)">
              <Input {...form.register("region")} autoComplete="address-level1" />
            </FormField>

            <FormField label="Country" error={form.formState.errors.country?.message} required>
              <Input {...form.register("country")} autoComplete="country-name" />
            </FormField>
          </div>
        </fieldset>

        {/* ---------------------------------------------------- Payment */}
        <fieldset className="space-y-5">
          <Legend step="03" title="Payment" />

          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) =>
              form.setValue("paymentMethod", value as CheckoutInput["paymentMethod"])
            }
            className="grid gap-3"
          >
            {paymentMethods.map((method) => (
              <OptionCard
                key={method.value}
                id={method.value}
                value={method.value}
                title={method.label}
                hint={method.hint}
                selected={paymentMethod === method.value}
              />
            ))}
          </RadioGroup>

          <FormField label="Order notes (optional)">
            <Textarea
              {...form.register("notes")}
              rows={4}
              placeholder="Anything we should know — a deadline, a dye lot to match, a landmark for the courier."
            />
          </FormField>
        </fieldset>
      </div>

      {/* ----------------------------------------------------- Summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-4xl border border-border/70 bg-card p-7">
          <h2 className="font-display text-xl">Your order</h2>

          <ul className="mt-6 space-y-4">
            {lines.map((line) => (
              <li key={lineKey(line.productId, line.color)} className="flex gap-3.5">
                <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {line.image ? (
                    <Image src={line.image} alt="" fill sizes="56px" className="object-cover" />
                  ) : null}
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[0.65rem] font-medium text-white">
                    {line.quantity}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{line.name}</span>
                  {line.color ? (
                    <span className="block text-xs text-muted-foreground">{line.color}</span>
                  ) : null}
                </span>
                <span className="shrink-0 text-sm tabular-nums">
                  {formatPrice(line.unitPrice * line.quantity, line.currency)}
                </span>
              </li>
            ))}
          </ul>

          <Separator className="my-6" />

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(totals.subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {deliveryMethod === "collection" ? "Collection" : "Delivery"}
              </dt>
              <dd className="tabular-nums">
                {totals.shipping === 0 ? "Free" : formatPrice(totals.shipping, currency)}
              </dd>
            </div>
          </dl>

          <Separator className="my-6" />

          <div className="flex items-baseline justify-between">
            <span className="font-medium">Total</span>
            <span className="font-display text-3xl tabular-nums">
              {formatPrice(totals.total, currency)}
            </span>
          </div>

          <Button
            type="submit"
            variant="luxe"
            size="lg"
            className="mt-7 w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="animate-spin" /> Placing order
              </>
            ) : (
              <>
                <Lock /> Place order
              </>
            )}
          </Button>

          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
            No card details are taken on this site. We confirm every order by WhatsApp before
            cutting.
          </p>
        </div>
      </aside>
    </form>
  );
}

function Legend({ step, title }: { step: string; title: string }) {
  return (
    <legend className="mb-2 flex items-center gap-4">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-700 text-xs font-medium text-white">
        {step}
      </span>
      <span className="font-display text-2xl">{title}</span>
    </legend>
  );
}

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? (
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        ) : null}
      </Label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function OptionCard({
  id,
  value,
  title,
  hint,
  selected,
}: {
  id: string;
  value: string;
  title: string;
  hint: string;
  selected: boolean;
}) {
  return (
    <Label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3.5 rounded-3xl border p-5 transition-all duration-300 ease-luxe",
        selected
          ? "border-brand-500 bg-brand-50/60 dark:bg-brand-800/30"
          : "border-border hover:border-brand-300",
      )}
    >
      <RadioGroupItem id={id} value={value} className="mt-0.5" />
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-1 block text-xs font-normal leading-relaxed text-muted-foreground">
          {hint}
        </span>
      </span>
    </Label>
  );
}

function OrderConfirmation({ order }: { order: PlacedOrder }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 rounded-4xl border border-border/70 bg-card p-12 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-brand-50 dark:bg-brand-800/50">
        <CheckCircle2 className="h-9 w-9 text-brand-500" aria-hidden />
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-3xl">Order received</h2>
        <p className="leading-relaxed text-muted-foreground">
          Your reference is{" "}
          <strong className="font-medium text-foreground">{order.orderNumber}</strong>. We have sent
          a confirmation to {order.email} and will message you on WhatsApp before we cut.
        </p>
      </div>

      <p className="rounded-3xl bg-secondary/70 px-6 py-4 text-sm">
        Total{" "}
        <strong className="font-display text-xl">
          {formatPrice(order.total, order.currency)}
        </strong>
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild variant="luxe">
          <Link href="/account/orders">View my orders</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/shop">Keep shopping</Link>
        </Button>
      </div>
    </div>
  );
}
