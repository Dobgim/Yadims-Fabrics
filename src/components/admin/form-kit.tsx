"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { cn, slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ActionResult } from "@/lib/validations";

/** Reads the first error for a field out of an action result. */
export function fieldErrorFrom(state: ActionResult<unknown> | null, field: string) {
  return state && !state.ok ? state.fieldErrors?.[field]?.[0] : undefined;
}

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? (
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        ) : null}
      </Label>
      {children}
      {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** A titled panel. Editors are long, so they are broken into these. */
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 sm:p-7">
      <h2 className="font-display text-xl">{title}</h2>
      {description ? (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

/** A labelled toggle that submits like a checkbox — Radix Switch does not. */
export function ToggleField({
  name,
  label,
  description,
  defaultChecked = false,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = React.useState(defaultChecked);

  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-border px-4 py-3.5">
      <div className="min-w-0">
        <Label htmlFor={name} className="cursor-pointer">
          {label}
        </Label>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {/* Radix renders a button, not an input, so the value is mirrored here. */}
      {checked ? <input type="hidden" name={name} value="on" /> : null}
      <Switch id={name} checked={checked} onCheckedChange={setChecked} className="mt-0.5" />
    </div>
  );
}

/** Native select styled to match `Input`. Keeps the form pure-HTML. */
export const SelectField = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
SelectField.displayName = "SelectField";

/**
 * Title and URL slug, paired.
 *
 * The slug follows the title while it is still untouched, then stops the moment
 * the owner edits it by hand — changing the slug of a live product breaks its
 * links, so it must never move on its own once it has been set deliberately.
 */
export function TitleAndSlug({
  titleLabel,
  titleName = "name",
  slugPrefix,
  defaultTitle = "",
  defaultSlug = "",
  titleError,
  slugError,
  /** Editing an existing row: never auto-follow, the URL is already public. */
  locked = false,
}: {
  titleLabel: string;
  titleName?: string;
  slugPrefix: string;
  defaultTitle?: string;
  defaultSlug?: string;
  titleError?: string;
  slugError?: string;
  locked?: boolean;
}) {
  const [title, setTitle] = React.useState(defaultTitle);
  const [slug, setSlug] = React.useState(defaultSlug);
  const [linked, setLinked] = React.useState(!locked && !defaultSlug);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label={titleLabel} htmlFor={titleName} required error={titleError}>
        <Input
          id={titleName}
          name={titleName}
          value={title}
          required
          onChange={(event) => {
            setTitle(event.target.value);
            if (linked) setSlug(slugify(event.target.value));
          }}
        />
      </Field>

      <Field
        label="URL slug"
        htmlFor="slug"
        required
        error={slugError}
        hint={`${slugPrefix}${slug || "…"}`}
      >
        <Input
          id="slug"
          name="slug"
          value={slug}
          required
          onChange={(event) => {
            setLinked(false);
            setSlug(event.target.value);
          }}
          onBlur={(event) => setSlug(slugify(event.target.value))}
        />
      </Field>
    </div>
  );
}

export function SubmitButton({
  label = "Save",
  pendingLabel = "Saving",
  className,
}: {
  label?: string;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="luxe" size="lg" disabled={pending} className={className}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> {pendingLabel}
        </>
      ) : (
        <>
          <Save /> {label}
        </>
      )}
    </Button>
  );
}

/**
 * Destructive action behind a typed-free confirmation dialog. Deletion here is
 * permanent and there is no undo, so it always asks.
 */
export function DeleteButton({
  action,
  id,
  entity,
  name,
  onDeleted,
  variant = "ghost",
  size = "sm",
  className,
  children,
}: {
  action: (id: string) => Promise<ActionResult>;
  id: string;
  /** "fabric", "category", … used in the prompt. */
  entity: string;
  name: string;
  onDeleted?: () => void;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const confirm = () =>
    startTransition(async () => {
      const result = await action(id);
      if (result.ok) {
        toast.success(result.message);
        setOpen(false);
        onDeleted?.();
      } else {
        toast.error(result.message);
      }
    });

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn("text-destructive hover:text-destructive", className)}
        onClick={() => setOpen(true)}
        aria-label={`Delete ${name}`}
      >
        {children ?? (
          <>
            <Trash2 /> Delete
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this {entity}?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">{name}</span> will be removed
              permanently. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Keep it
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirm}
              disabled={pending}
            >
              {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
              Delete {entity}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
