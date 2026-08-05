"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { deleteAddress, saveAddress } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AddressRow } from "@/types/database";
import type { ActionResult } from "@/lib/validations";

export function AddressManager({ addresses }: { addresses: AddressRow[] }) {
  const [editing, setEditing] = React.useState<AddressRow | null>(null);
  const [open, setOpen] = React.useState(false);

  const openFor = (address: AddressRow | null) => {
    setEditing(address);
    setOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">Addresses</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Saved addresses pre-fill your checkout. The default is used first.
          </p>
        </div>
        <Button variant="luxe" onClick={() => openFor(null)}>
          <Plus /> Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center gap-5 rounded-4xl border border-dashed border-border py-16 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary">
            <MapPin className="h-7 w-7 text-brand-500" aria-hidden />
          </div>
          <div className="space-y-2">
            <p className="font-display text-xl">No addresses saved</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Add one and checkout fills itself in next time.
            </p>
          </div>
          <Button variant="outline" onClick={() => openFor(null)}>
            <Plus /> Add your first address
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <li
              key={address.id}
              className={cn(
                "relative rounded-4xl border bg-card p-6",
                address.is_default ? "border-brand-500" : "border-border/70",
              )}
            >
              {address.is_default ? (
                <span className="absolute right-6 top-6 rounded-full bg-brand-500 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-white">
                  Default
                </span>
              ) : null}

              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {address.label}
              </p>
              <p className="mt-3 font-medium">{address.full_name}</p>
              <address className="mt-1.5 text-sm not-italic leading-relaxed text-muted-foreground">
                {address.line1}
                {address.line2 ? (
                  <>
                    <br />
                    {address.line2}
                  </>
                ) : null}
                <br />
                {address.city}
                {address.region ? `, ${address.region}` : ""}
                <br />
                {address.country}
                <br />
                {address.phone}
              </address>

              <div className="mt-5 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openFor(address)}>
                  <Pencil /> Edit
                </Button>
                <form action={deleteAddress}>
                  <input type="hidden" name="addressId" value={address.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 /> Remove
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddressDialog
        key={editing?.id ?? "new"}
        address={editing}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}

function AddressDialog({
  address,
  open,
  onOpenChange,
}: {
  address: AddressRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(saveAddress, null);

  React.useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      onOpenChange(false);
    } else {
      toast.error(state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const errorFor = (field: string) =>
    state && !state.ok ? state.fieldErrors?.[field]?.[0] : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto rounded-4xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {address ? "Edit address" : "Add an address"}
          </DialogTitle>
          <DialogDescription>
            Used to pre-fill checkout and printed on the courier label.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="mt-4 space-y-4" noValidate>
          {address ? <input type="hidden" name="addressId" value={address.id} /> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <AddressField id="label" label="Label" error={errorFor("label")}>
              <Input id="label" name="label" defaultValue={address?.label ?? "Home"} />
            </AddressField>

            <AddressField id="fullName" label="Recipient" error={errorFor("fullName")}>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={address?.full_name ?? ""}
                autoComplete="name"
                required
              />
            </AddressField>
          </div>

          <AddressField id="phone" label="Phone" error={errorFor("phone")}>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={address?.phone ?? ""}
              autoComplete="tel"
              required
            />
          </AddressField>

          <AddressField id="line1" label="Address" error={errorFor("line1")}>
            <Input
              id="line1"
              name="line1"
              defaultValue={address?.line1 ?? ""}
              autoComplete="address-line1"
              required
            />
          </AddressField>

          <AddressField id="line2" label="Apartment, landmark (optional)">
            <Input
              id="line2"
              name="line2"
              defaultValue={address?.line2 ?? ""}
              autoComplete="address-line2"
            />
          </AddressField>

          <div className="grid gap-4 sm:grid-cols-3">
            <AddressField id="city" label="City" error={errorFor("city")}>
              <Input
                id="city"
                name="city"
                defaultValue={address?.city ?? "Yaoundé"}
                autoComplete="address-level2"
                required
              />
            </AddressField>

            <AddressField id="region" label="Region">
              <Input
                id="region"
                name="region"
                defaultValue={address?.region ?? ""}
                autoComplete="address-level1"
              />
            </AddressField>

            <AddressField id="country" label="Country" error={errorFor("country")}>
              <Input
                id="country"
                name="country"
                defaultValue={address?.country ?? "Cameroon"}
                autoComplete="country-name"
                required
              />
            </AddressField>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Checkbox id="isDefault" name="isDefault" defaultChecked={address?.is_default} />
            <Label htmlFor="isDefault" className="text-sm font-normal text-muted-foreground">
              Use this as my default address
            </Label>
          </div>

          <SaveButton isEdit={Boolean(address)} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddressField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SaveButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="luxe" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Saving
        </>
      ) : isEdit ? (
        "Save changes"
      ) : (
        "Save address"
      )}
    </Button>
  );
}
