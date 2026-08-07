"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { requestPasswordReset, signIn } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/validations";

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

function Field({
  id,
  label,
  error,
  children,
  hint,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id}>{label}</Label>
        {hint}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-11" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function Submit({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="luxe" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> {pendingLabel}
        </>
      ) : (
        label
      )}
    </Button>
  );
}

/** Toasts server-action results and returns a field-error lookup. */
function useActionFeedback(state: ActionResult | null, onSuccess?: () => void) {
  React.useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      onSuccess?.();
    } else {
      toast.error(state.message);
    }
    // `onSuccess` is intentionally excluded — callers pass inline closures.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (field: string) => (state && !state.ok ? state.fieldErrors?.[field]?.[0] : undefined);
}

/* ------------------------------------------------------------------ */
/* Sign in                                                             */
/* ------------------------------------------------------------------ */

export function SignInForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  const [state, formAction] = useActionState<ActionResult | null, FormData>(signIn, null);
  const errorFor = useActionFeedback(state);

  return (
    <div>
      <h1 className="font-display text-3xl">Shop sign in</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        For the owner of the shop. Customers order without an account.
      </p>

      <form action={formAction} className="mt-9 space-y-5" noValidate>
        <input type="hidden" name="next" value={next} />

        <Field id="email" label="Email" error={errorFor("email")}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@email.com"
          />
        </Field>

        <Field
          id="password"
          label="Password"
          error={errorFor("password")}
          hint={
            <Link href="/forgot-password" className="text-xs text-brand-600 link-underline">
              Forgot?
            </Link>
          }
        >
          <PasswordInput id="password" name="password" autoComplete="current-password" required />
        </Field>

        <Submit label="Sign in" pendingLabel="Signing in" />
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Forgot password                                                     */
/* ------------------------------------------------------------------ */

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    requestPasswordReset,
    null,
  );
  const errorFor = useActionFeedback(state);

  return (
    <div>
      <h1 className="font-display text-3xl">Reset your password</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Enter the shop email address and we will send a link to set a new password.
      </p>

      <form action={formAction} className="mt-9 space-y-5" noValidate>
        <Field id="email" label="Email" error={errorFor("email")}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@email.com"
          />
        </Field>

        <Submit label="Send reset link" pendingLabel="Sending" />
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/sign-in" className="text-brand-600 link-underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
